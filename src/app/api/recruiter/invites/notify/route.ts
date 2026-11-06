import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendTelegramMessage,
  formatRecruiterInviteTelegramMessage,
} from "@/lib/notifications/telegram";
import { decryptApiKey } from "@/lib/ai/crypto";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`invite-notify:${user.id}`, {
      max: 15,
      windowMs: 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many invite notification requests" },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { receiverId, jobId, message } = body;

    if (!receiverId || !jobId) {
      return NextResponse.json(
        { error: "receiverId and jobId required" },
        { status: 400 }
      );
    }

    // Use SECURITY DEFINER RPC that verifies an invite from user.id to receiverId for jobId exists
    const { data: ctx, error: rpcError } = await supabase.rpc(
      "get_invite_notification_context",
      {
        p_receiver_id: receiverId,
        p_job_id: jobId,
      }
    );

    if (rpcError || !ctx?.ok) {
      return NextResponse.json(
        {
          success: false,
          notified: false,
          error: ctx?.error || rpcError?.message || "Invite verification failed",
        },
        { status: 403 }
      );
    }

    const rawStoredToken = ctx.telegram_bot_token as string | null;
    const chatId = ctx.telegram_chat_id as string | null;

    if (!rawStoredToken || !chatId) {
      return NextResponse.json({
        success: true,
        notified: false,
        reason: "No telegram configured",
      });
    }

    const botToken = decryptApiKey(rawStoredToken) || rawStoredToken;
    const origin = req.nextUrl.origin || "https://huntboard.app";

    const text = formatRecruiterInviteTelegramMessage({
      recruiterName: (ctx.recruiter_name as string) || "Recruiter",
      companyName: (ctx.company_name as string) || "Company",
      role: (ctx.job_title as string) || "Position",
      message: message || "You have received an interview invitation.",
      inviteUrl: `${origin}/invites`,
    });

    const sendRes = await sendTelegramMessage({
      botToken,
      chatId,
      text,
    });

    if (!sendRes.ok) {
      return NextResponse.json(
        { success: false, error: sendRes.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, notified: true });
  } catch (err: unknown) {
    console.error("Invite notification error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to dispatch notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
