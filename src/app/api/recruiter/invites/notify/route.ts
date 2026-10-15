import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  sendTelegramMessage,
  formatRecruiterInviteTelegramMessage,
} from "@/lib/notifications/telegram";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, jobId, message } = body;

    if (!receiverId || !jobId) {
      return NextResponse.json({ error: "receiverId and jobId required" }, { status: 400 });
    }

    // Load receiver profile and job details
    const [receiverRes, jobRes, senderRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, telegram_bot_token, telegram_chat_id")
        .eq("id", receiverId)
        .single(),
      supabase
        .from("recruiter_jobs")
        .select("title, company_name")
        .eq("id", jobId)
        .single(),
      supabase
        .from("profiles")
        .select("full_name, company_name")
        .eq("id", user.id)
        .single(),
    ]);

    const receiver = receiverRes.data;
    const job = jobRes.data;
    const sender = senderRes.data;

    if (!receiver?.telegram_bot_token || !receiver?.telegram_chat_id) {
      // Candidate hasn't configured Telegram notifications — nothing to send
      return NextResponse.json({ success: true, notified: false, reason: "No telegram configured" });
    }

    const botToken = receiver.telegram_bot_token;
    const chatId = receiver.telegram_chat_id;
    const origin = req.nextUrl.origin || "https://huntboard.app";

    const text = formatRecruiterInviteTelegramMessage({
      recruiterName: sender?.full_name || "Recruiter",
      companyName: job?.company_name || sender?.company_name || "Company",
      role: job?.title || "Position",
      message: message || "You have received an interview invitation.",
      inviteUrl: `${origin}/invites`,
    });

    const sendRes = await sendTelegramMessage({
      botToken,
      chatId,
      text,
    });

    if (!sendRes.ok) {
      return NextResponse.json({ success: false, error: sendRes.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, notified: true });
  } catch (err: any) {
    console.error("Invite notification error:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch notification" }, { status: 500 });
  }
}
