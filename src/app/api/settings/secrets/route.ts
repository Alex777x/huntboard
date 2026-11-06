import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encryptApiKey, decryptApiKey } from "@/lib/ai/crypto";
import { checkRateLimit } from "@/lib/security/rate-limit";

function maskSecret(val: string): string {
  if (!val) return "";
  if (val.length <= 8) return "••••••••";
  return `${val.slice(0, 4)}••••••••${val.slice(-4)}`;
}

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        configuredProviders: { openai: false, gemini: false, anthropic: false },
        maskedKeys: { openai: "", gemini: "", anthropic: "" },
        telegramConfigured: false,
        telegramChatId: "",
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_settings, telegram_bot_token, telegram_chat_id")
      .eq("id", user.id)
      .single();

    const encryptedKeys =
      (profile?.ai_settings as { encrypted_keys?: Record<string, string> } | null)
        ?.encrypted_keys || {};

    const openaiRaw = encryptedKeys.openai ? decryptApiKey(encryptedKeys.openai) : "";
    const geminiRaw = encryptedKeys.gemini ? decryptApiKey(encryptedKeys.gemini) : "";
    const anthropicRaw = encryptedKeys.anthropic ? decryptApiKey(encryptedKeys.anthropic) : "";
    const tgRaw = profile?.telegram_bot_token
      ? decryptApiKey(profile.telegram_bot_token) || profile.telegram_bot_token
      : "";

    return NextResponse.json({
      configuredProviders: {
        openai: Boolean(openaiRaw),
        gemini: Boolean(geminiRaw),
        anthropic: Boolean(anthropicRaw),
      },
      maskedKeys: {
        openai: maskSecret(openaiRaw),
        gemini: maskSecret(geminiRaw),
        anthropic: maskSecret(anthropicRaw),
      },
      telegramConfigured: Boolean(tgRaw),
      maskedTelegramToken: maskSecret(tgRaw),
      telegramChatId: profile?.telegram_chat_id || "",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load secret status";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ ok: true });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`secrets:${user.id}`, { max: 20, windowMs: 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many secret update requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const {
      keys,
      deleteProvider,
      provider,
      model,
      visibleToRecruiters,
      telegramBotToken,
      telegramChatId,
    } = body;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("ai_settings")
      .eq("id", user.id)
      .single();

    const currentAiSettings =
      (existingProfile?.ai_settings as {
        provider?: string;
        model?: string;
        encrypted_keys?: Record<string, string>;
      } | null) || {};
    const nextEncryptedKeys: Record<string, string> = {
      ...(currentAiSettings.encrypted_keys || {}),
    };

    if (deleteProvider && ["openai", "gemini", "anthropic"].includes(deleteProvider)) {
      delete nextEncryptedKeys[deleteProvider];
    }

    if (keys && typeof keys === "object") {
      for (const p of ["openai", "gemini", "anthropic"] as const) {
        const rawVal = typeof keys[p] === "string" ? keys[p].trim() : undefined;
        if (rawVal !== undefined && !rawVal.includes("••••")) {
          if (rawVal === "") {
            delete nextEncryptedKeys[p];
          } else {
            const enc = encryptApiKey(rawVal);
            if (enc) nextEncryptedKeys[p] = enc;
          }
        }
      }
    }

    const updatePayload: Record<string, unknown> = {
      ai_settings: {
        provider: provider || currentAiSettings.provider || "openai",
        model: model || currentAiSettings.model || "gpt-4o",
        encrypted_keys: nextEncryptedKeys,
      },
      updated_at: new Date().toISOString(),
    };

    if (typeof visibleToRecruiters === "boolean") {
      updatePayload.visible_to_recruiters = visibleToRecruiters;
    }

    if (typeof telegramBotToken === "string" && !telegramBotToken.includes("••••")) {
      const trimmedToken = telegramBotToken.trim();
      updatePayload.telegram_bot_token = trimmedToken ? encryptApiKey(trimmedToken) : null;
    }

    if (typeof telegramChatId === "string") {
      updatePayload.telegram_chat_id = telegramChatId.trim() || null;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save encrypted secrets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
