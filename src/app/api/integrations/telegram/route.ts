import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendTelegramMessage,
  formatRecruiterInviteTelegramMessage,
} from "@/lib/notifications/telegram";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    let user: { id: string } | null = null;
    // Authenticate the user — only authenticated users can trigger notifications
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      user = authData?.user || null;
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized. Please sign in." },
          { status: 401 }
        );
      }
    }

    // Rate limiting: max 10 notifications per minute per caller
    const clientIdentifier = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "telegram-caller";
    const rateLimitKey = user?.id ? `tg:user:${user.id}` : `tg:ip:${clientIdentifier}`;
    const rl = checkRateLimit(rateLimitKey, { max: 10, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { ok: false, error: "Too many Telegram notification requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { action, botToken, chatId, inviteData } = body;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { ok: false, error: "Bot token and Chat ID are required." },
        { status: 400 }
      );
    }

    // Validate botToken format (Telegram bot tokens follow pattern: digits:alphanumeric)
    const botTokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
    if (!botTokenPattern.test(botToken)) {
      return NextResponse.json(
        { ok: false, error: "Invalid bot token format." },
        { status: 400 }
      );
    }

    // Validate chatId format (numeric, possibly negative for groups)
    const chatIdPattern = /^-?\d+$/;
    if (!chatIdPattern.test(String(chatId))) {
      return NextResponse.json(
        { ok: false, error: "Invalid chat ID format." },
        { status: 400 }
      );
    }

    if (action === "test") {
      const testText = [
        `🤖 <b>HuntBoard: Telegram Notifications Connected!</b>`,
        ``,
        `✅ Your Telegram bot is successfully linked to HuntBoard.`,
        `You will now receive instant alerts whenever verified employers invite you to interview!`,
      ].join("\n");

      const result = await sendTelegramMessage({
        botToken,
        chatId,
        text: testText,
      });

      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: "Test notification sent successfully!" });
    }

    if (action === "notify-invite") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const inviteUrl = `${baseUrl.replace(/\/$/, "")}/invites`;

      const messageText = formatRecruiterInviteTelegramMessage({
        recruiterName: inviteData?.recruiterName || "Verified Recruiter",
        companyName: inviteData?.companyName || "Employer",
        role: inviteData?.role || "Open Role",
        message: inviteData?.message,
        inviteUrl,
      });

      const result = await sendTelegramMessage({
        botToken,
        chatId,
        text: messageText,
      });

      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: "Invite alert dispatched to Telegram." });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
