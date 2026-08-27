import { NextResponse } from "next/server";
import {
  sendTelegramMessage,
  formatRecruiterInviteTelegramMessage,
} from "@/lib/notifications/telegram";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, botToken, chatId, inviteData } = body;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { ok: false, error: "Bot token and Chat ID are required." },
        { status: 400 }
      );
    }

    if (action === "test") {
      const testText = [
        `🤖 *HuntBoard: Telegram Notifications Connected!*`,
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
      const messageText = formatRecruiterInviteTelegramMessage({
        recruiterName: inviteData?.recruiterName || "Verified Recruiter",
        companyName: inviteData?.companyName || "Employer",
        role: inviteData?.role || "Open Role",
        message: inviteData?.message,
        inviteUrl: inviteData?.inviteUrl || "http://localhost:3000/invites",
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
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
