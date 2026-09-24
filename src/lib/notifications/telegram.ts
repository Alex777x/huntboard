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

function escapeTelegramMarkdown(text: string): string {
  return text.replace(/([_*`\[])/g, "\\$1");
}

/**
 * Format markdown alert message for incoming recruiter invites
 */
export function formatRecruiterInviteTelegramMessage(
  params: RecruiterInviteNotificationParams
): string {
  const safeCompany = escapeTelegramMarkdown(params.companyName);
  const safeRecruiter = escapeTelegramMarkdown(params.recruiterName);
  const safeRole = escapeTelegramMarkdown(params.role);

  const lines = [
    `🎯 *HuntBoard: New Recruiter Interview Invite!*`,
    ``,
    `🏢 *Company:* ${safeCompany}`,
    `👤 *Recruiter:* ${safeRecruiter}`,
    `💼 *Position:* ${safeRole}`,
  ];

  if (params.message) {
    lines.push(``, `💬 *Message:*`, `_${escapeTelegramMarkdown(params.message)}_`);
  }

  const rawUrl = params.inviteUrl || "http://localhost:3000/invites";
  const safeUrl = rawUrl.replace(/[)\s]/g, "");
  lines.push(``, `👉 [Review & Accept on HuntBoard](${safeUrl})`);

  return lines.join("\n");
}

/**
 * Send markdown message via Telegram Bot API
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
        parse_mode: "Markdown",
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
