export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled?: boolean;
}

export interface RecruiterInviteNotificationParams {
  recruiterName: string;
  companyName: string;
  role: string;
  message?: string;
  inviteUrl?: string;
}

export function escapeTelegramHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Format HTML alert message for incoming recruiter invites
 */
export function formatRecruiterInviteTelegramMessage(
  params: RecruiterInviteNotificationParams
): string {
  const safeCompany = escapeTelegramHtml(params.companyName);
  const safeRecruiter = escapeTelegramHtml(params.recruiterName);
  const safeRole = escapeTelegramHtml(params.role);

  const lines = [
    `🎯 <b>HuntBoard: New Recruiter Interview Invite!</b>`,
    ``,
    `🏢 <b>Company:</b> ${safeCompany}`,
    `👤 <b>Recruiter:</b> ${safeRecruiter}`,
    `💼 <b>Position:</b> ${safeRole}`,
  ];

  if (params.message) {
    lines.push(``, `💬 <b>Message:</b>`, `<i>${escapeTelegramHtml(params.message)}</i>`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const safeUrl = `${baseUrl.replace(/\/$/, "")}/invites`;
  lines.push(``, `👉 <a href="${safeUrl}">Review &amp; Accept on HuntBoard</a>`);

  return lines.join("\n");
}

/**
 * Send HTML message via Telegram Bot API
 */
export async function sendTelegramMessage(params: {
  botToken: string;
  chatId: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { botToken, chatId, text } = params;

  if (!botToken?.trim() || !chatId?.trim()) {
    return { ok: false, error: "Missing botToken or chatId" };
  }

  try {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const endpoint = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      return {
        ok: false,
        error: data.description || `Telegram API error (${res.status})`,
      };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message || "Failed to reach Telegram API" };
  }
}
