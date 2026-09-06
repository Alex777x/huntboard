"use client";

import * as React from "react";
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Lock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  RefreshCw,
  Zap,
  Radio,
  ExternalLink,
  Send,
  Puzzle,
  Bell,
  Calendar,
  Download,
  Smartphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/I18nProvider";
import { localeIncludes } from "@/lib/utils";
import { usePwa } from "@/components/pwa/PwaProvider";
import { LATEST_CURATED_MODELS, AIProviderName, AIModelOption } from "@/lib/ai/types";

// Filter out non-text, media, image, video, audio, TTS, and embedding models
function isStrictTextLLM(id: string, displayName: string | undefined, description: string | undefined, locale: string): boolean {
  const text = `${id} ${displayName || ""} ${description || ""}`;

  const blacklisted = [
    "imagen",
    "image",
    "veo",
    "video",
    "banana",
    "nano",
    "aqa",
    "embedding",
    "embed",
    "tts",
    "speech",
    "audio",
    "voice",
    "whisper",
    "transcribe",
    "transcription",
    "dall-e",
    "sora",
    "moderation",
    "realtime",
    "instruct",
    "babbage",
    "davinci",
    "curie",
    "ada",
    "canary",
    "robotics",
    "vision-only",
    "computer-use",
    "search-preview",
  ];

  for (const word of blacklisted) {
    if (localeIncludes(text, word, locale)) {
      return false;
    }
  }

  return true;
}

interface ProviderConfig {
  apiKey: string;
  selectedModel: string;
  customModel: string;
  availableModels: AIModelOption[];
  isFetchingModels: boolean;
  isTesting: boolean;
  testSuccessMessage: string | null;
  testError: string | null;
}

const PROVIDERS: {
  id: AIProviderName;
  name: string;
  icon: string;
  defaultModel: string;
  placeholder: string;
  docUrl: string;
}[] = [
  {
    id: "openai",
    name: "OpenAI",
    icon: "🟢",
    defaultModel: "gpt-5.6-sol",
    placeholder: "sk-proj-...",
    docUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "🔵",
    defaultModel: "gemini-3.7-flash",
    placeholder: "AIzaSy...",
    docUrl: "https://aistudio.google.com/app/apikey",
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    icon: "🟣",
    defaultModel: "claude-3-7-sonnet-20250219",
    placeholder: "sk-ant-...",
    docUrl: "https://console.anthropic.com/settings/keys",
  },
];

export default function SettingsPage() {
  const { t, locale } = useI18n();

  // Active provider (only ONE active across the entire system)
  const [activeProvider, setActiveProvider] = React.useState<AIProviderName>("openai");
  const [isVisibleToRecruiters, setIsVisibleToRecruiters] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // State per provider
  const [configs, setConfigs] = React.useState<Record<AIProviderName, ProviderConfig>>({
    openai: {
      apiKey: "",
      selectedModel: "gpt-5.6-sol",
      customModel: "",
      availableModels: LATEST_CURATED_MODELS.openai,
      isFetchingModels: false,
      isTesting: false,
      testSuccessMessage: null,
      testError: null,
    },
    gemini: {
      apiKey: "",
      selectedModel: "gemini-3.7-flash",
      customModel: "",
      availableModels: LATEST_CURATED_MODELS.gemini,
      isFetchingModels: false,
      isTesting: false,
      testSuccessMessage: null,
      testError: null,
    },
    anthropic: {
      apiKey: "",
      selectedModel: "claude-3-7-sonnet-20250219",
      customModel: "",
      availableModels: LATEST_CURATED_MODELS.anthropic,
      isFetchingModels: false,
      isTesting: false,
      testSuccessMessage: null,
      testError: null,
    },
  });

  // Telegram Integration State
  const [telegramBotToken, setTelegramBotToken] = React.useState("");
  const [telegramChatId, setTelegramChatId] = React.useState("");
  const [isTestingTelegram, setIsTestingTelegram] = React.useState(false);
  const [telegramSuccess, setTelegramSuccess] = React.useState<string | null>(null);
  const [telegramError, setTelegramError] = React.useState<string | null>(null);

  // PWA & Push Notifications State
  const { isInstalled, canInstall, installApp, pushPermission, requestPushPermission, sendTestPush } = usePwa();
  const [isTestingPush, setIsTestingPush] = React.useState(false);
  const [pushSuccess, setPushSuccess] = React.useState<string | null>(null);

  const handleTestPushNotification = async () => {
    setIsTestingPush(true);
    setPushSuccess(null);
    try {
      await sendTestPush();
      setPushSuccess(t.pwa.testPushSuccess);
      setTimeout(() => setPushSuccess(null), 3500);
    } finally {
      setIsTestingPush(false);
    }
  };

  // Load configuration and cached live models from localStorage with strict text-only sanitize
  React.useEffect(() => {
    try {
      const savedActive = (localStorage.getItem("huntboard_ai_provider") as AIProviderName) || "openai";
      setActiveProvider(savedActive);

      const savedVisibility = localStorage.getItem("huntboard_recruiter_visibility") === "true";
      setIsVisibleToRecruiters(savedVisibility);

      setTelegramBotToken(localStorage.getItem("huntboard_telegram_bot_token") || "");
      setTelegramChatId(localStorage.getItem("huntboard_telegram_chat_id") || "");

      // Load multi-keys
      const rawKeys = localStorage.getItem("huntboard_ai_keys");
      const multiKeys: Record<string, string> = rawKeys ? JSON.parse(rawKeys) : {};

      // Fallback single key
      const legacyKey = localStorage.getItem("huntboard_api_key") || "";
      if (legacyKey && !multiKeys[savedActive]) {
        multiKeys[savedActive] = legacyKey;
      }

      // Load multi-models
      const rawModels = localStorage.getItem("huntboard_ai_selected_models");
      const multiModels: Record<string, string> = rawModels ? JSON.parse(rawModels) : {};
      const legacyModel = localStorage.getItem("huntboard_ai_model") || "";

      // Load cached model lists from previous API fetches and filter out non-text models
      const rawCachedModels = localStorage.getItem("huntboard_ai_cached_models");
      const cachedModelsMap: Record<string, AIModelOption[]> = rawCachedModels
        ? JSON.parse(rawCachedModels)
        : {};

      setConfigs((prev) => {
        const next = { ...prev };
        (Object.keys(next) as AIProviderName[]).forEach((p) => {
          const key = multiKeys[p] || (p === savedActive ? legacyKey : "");
          const model =
            multiModels[p] ||
            (p === savedActive && legacyModel ? legacyModel : next[p].selectedModel);
          const rawCached = cachedModelsMap[p] || LATEST_CURATED_MODELS[p] || [];

          // Sanitize cached list to remove any non-text models
          const sanitizedList = rawCached.filter((m) =>
            isStrictTextLLM(m.id, m.name, m.description, locale)
          );

          next[p] = {
            ...next[p],
            apiKey: key,
            selectedModel: model,
            availableModels: sanitizedList.length > 0 ? sanitizedList : LATEST_CURATED_MODELS[p],
          };
        });
        return next;
      });
    } catch (e) {
      console.error("Error loading settings:", e);
    }
  }, []);

  const updateProviderConfig = (p: AIProviderName, updates: Partial<ProviderConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [p]: {
        ...prev[p],
        ...updates,
      },
    }));
  };

  // Internal helper to fetch models
  const fetchModelsForProvider = async (p: AIProviderName, keyToUse: string) => {
    if (!keyToUse) return;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fetch-models",
          apiKey: keyToUse,
          provider: p,
        }),
      });

      const data = await res.json();
      if (data.ok && Array.isArray(data.models) && data.models.length > 0) {
        const textOnlyModels = data.models.filter((m: AIModelOption) =>
          isStrictTextLLM(m.id, m.name, m.description, locale)
        );

        updateProviderConfig(p, {
          availableModels: textOnlyModels,
          isFetchingModels: false,
          testError: null,
        });

        // Persist to cached models in localStorage
        try {
          const existingRaw = localStorage.getItem("huntboard_ai_cached_models");
          const map = existingRaw ? JSON.parse(existingRaw) : {};
          map[p] = textOnlyModels;
          localStorage.setItem("huntboard_ai_cached_models", JSON.stringify(map));
        } catch (e) {
          console.error("Failed to cache models:", e);
        }
      } else {
        updateProviderConfig(p, {
          isFetchingModels: false,
          testError: data.error || null,
        });
      }
    } catch (err: any) {
      console.error(`Fetch models error for ${p}:`, err);
      updateProviderConfig(p, { isFetchingModels: false });
    }
  };

  // Manual Trigger to Fetch Live Models via API
  const handleFetchLiveModels = async (p: AIProviderName) => {
    const config = configs[p];
    const key = config.apiKey.trim();
    if (!key) {
      updateProviderConfig(p, {
        testError: `Please enter your ${p.toUpperCase()} API key first to fetch your account models.`,
      });
      return;
    }

    updateProviderConfig(p, { isFetchingModels: true, testError: null, testSuccessMessage: null });
    await fetchModelsForProvider(p, key);
  };

  // Test Key & Live Connect
  const handleTestProviderKey = async (p: AIProviderName) => {
    const config = configs[p];
    const key = config.apiKey.trim();
    if (!key) {
      updateProviderConfig(p, {
        testError: `Please enter your ${p.toUpperCase()} API key.`,
      });
      return;
    }

    updateProviderConfig(p, {
      isTesting: true,
      testSuccessMessage: null,
      testError: null,
    });

    const effectiveModel =
      config.selectedModel === "custom"
        ? config.customModel.trim() || configs[p].selectedModel
        : config.selectedModel;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test-key",
          apiKey: key,
          provider: p,
          model: effectiveModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(
          data.error || `Failed to authenticate with ${p.toUpperCase()}. Please check your API key.`
        );
      }

      updateProviderConfig(p, {
        isTesting: false,
        testSuccessMessage:
          data.message || `Successfully connected to ${p.toUpperCase()}! Model '${effectiveModel}' is ready.`,
        testError: null,
      });

      // Fetch latest models on test success
      handleFetchLiveModels(p);
      handleSaveAll();
    } catch (err: any) {
      updateProviderConfig(p, {
        isTesting: false,
        testError: err.message || "Connection failed. Please check your API key.",
        testSuccessMessage: null,
      });
    }
  };

  // Save All Settings
  const handleSaveAll = (activeOverride?: AIProviderName) => {
    const active = activeOverride || activeProvider;
    const activeConfig = configs[active];
    const effectiveModel =
      activeConfig.selectedModel === "custom"
        ? activeConfig.customModel.trim()
        : activeConfig.selectedModel;

    // Keys dictionary
    const keysMap: Record<string, string> = {
      openai: configs.openai.apiKey.trim(),
      gemini: configs.gemini.apiKey.trim(),
      anthropic: configs.anthropic.apiKey.trim(),
    };

    // Models dictionary
    const modelsMap: Record<string, string> = {
      openai:
        configs.openai.selectedModel === "custom"
          ? configs.openai.customModel
          : configs.openai.selectedModel,
      gemini:
        configs.gemini.selectedModel === "custom"
          ? configs.gemini.customModel
          : configs.gemini.selectedModel,
      anthropic:
        configs.anthropic.selectedModel === "custom"
          ? configs.anthropic.customModel
          : configs.anthropic.selectedModel,
    };

    // Cached model lists
    const cachedModelsMap: Record<string, AIModelOption[]> = {
      openai: configs.openai.availableModels,
      gemini: configs.gemini.availableModels,
      anthropic: configs.anthropic.availableModels,
    };

    localStorage.setItem("huntboard_ai_keys", JSON.stringify(keysMap));
    localStorage.setItem("huntboard_ai_selected_models", JSON.stringify(modelsMap));
    localStorage.setItem("huntboard_ai_cached_models", JSON.stringify(cachedModelsMap));

    // Active Engine Single Keys for fast global access across all pages
    localStorage.setItem("huntboard_ai_provider", active);
    localStorage.setItem("huntboard_api_key", activeConfig.apiKey.trim());
    localStorage.setItem("huntboard_ai_model", effectiveModel);
    localStorage.setItem("huntboard_recruiter_visibility", String(isVisibleToRecruiters));

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Telegram Integration Handlers
  const handleSaveTelegram = () => {
    localStorage.setItem("huntboard_telegram_bot_token", telegramBotToken.trim());
    localStorage.setItem("huntboard_telegram_chat_id", telegramChatId.trim());
    setTelegramSuccess("Telegram settings saved successfully!");
    setTimeout(() => setTelegramSuccess(null), 3000);
  };

  const handleTestTelegram = async () => {
    if (!telegramBotToken.trim() || !telegramChatId.trim()) {
      setTelegramError("Please provide both Bot Token and Chat ID to test.");
      return;
    }

    setIsTestingTelegram(true);
    setTelegramSuccess(null);
    setTelegramError(null);

    try {
      const res = await fetch("/api/integrations/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          botToken: telegramBotToken.trim(),
          chatId: telegramChatId.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTelegramSuccess(t.integrations.testTelegramSuccess);
        handleSaveTelegram();
      } else {
        throw new Error(data.error || t.integrations.testTelegramError);
      }
    } catch (err: any) {
      setTelegramError(err.message || t.integrations.testTelegramError);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleSetActiveProvider = (p: AIProviderName) => {
    setActiveProvider(p);
    handleSaveAll(p);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.settings.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.settings.subtitle}
          </p>
        </div>

        <Button
          onClick={() => handleSaveAll()}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
        >
          {saved ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
          <span>{saved ? t.settings.savedBtn : t.settings.saveBtn}</span>
        </Button>
      </div>

      {/* Recruiter Visibility Privacy Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.settings.visibilityCardTitle}
              </h3>
              <Badge variant={isVisibleToRecruiters ? "success" : "secondary"} className="text-[10px]">
                {isVisibleToRecruiters ? t.profile.visibleBadge : t.profile.hiddenBadge}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {t.settings.visibilityCardDesc}
            </p>
          </div>

          <Button
            size="sm"
            variant={isVisibleToRecruiters ? "default" : "outline"}
            onClick={() => {
              const next = !isVisibleToRecruiters;
              setIsVisibleToRecruiters(next);
              localStorage.setItem("huntboard_recruiter_visibility", String(next));
            }}
            className={`text-xs gap-1.5 shrink-0 ${
              isVisibleToRecruiters
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isVisibleToRecruiters ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{isVisibleToRecruiters ? t.settings.visibleOn : t.settings.visibleOff}</span>
          </Button>
        </div>
      </Card>

      {/* Active AI Provider Overview Banner */}
      <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 dark:bg-slate-900/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Active AI Engine (Primary)
              </span>
              <Badge variant="purple" className="text-[10px] animate-pulse">
                Active Everywhere
              </Badge>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              Currently using <span className="font-bold text-slate-900 dark:text-white capitalize">{activeProvider}</span> with model{" "}
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                "{configs[activeProvider].selectedModel}"
              </span>{" "}
              for all CV rewrites, ATS scoring, and AI co-pilot tools.
            </p>
          </div>
        </div>
      </div>

      {/* Provider Cards with Live Model Fetching & Persistence */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Manage AI Providers & API Keys (Choose 1 Active)
          </h3>
          <span className="text-[11px] text-slate-500">
            Text LLMs only (Media/Image/Audio models filtered out)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {PROVIDERS.map((p) => {
            const config = configs[p.id];
            const isActive = activeProvider === p.id;

            return (
              <Card
                key={p.id}
                className={`p-6 space-y-5 transition-all shadow-sm ${
                  isActive
                    ? "border-indigo-500 ring-2 ring-indigo-500/30 bg-white dark:bg-slate-900/90"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-90 hover:opacity-100"
                }`}
              >
                {/* Provider Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{p.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </h4>
                        {isActive && (
                          <Badge variant="purple" className="text-[10px]">
                            ● Active Engine
                          </Badge>
                        )}
                        {config.apiKey && (
                          <Badge variant="success" className="text-[10px]">
                            Key Configured
                          </Badge>
                        )}
                      </div>
                      <a
                        href={p.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline mt-0.5 inline-flex items-center gap-1"
                      >
                        <span>Get {p.name} API Key from official dashboard</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleSetActiveProvider(p.id)}
                    className={`text-xs font-semibold gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isActive ? <Check className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />}
                    <span>{isActive ? "Currently Active Engine" : `Set ${p.name} as Active`}</span>
                  </Button>
                </div>

                {/* API Key Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p.name} API Key</span>
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) =>
                        updateProviderConfig(p.id, {
                          apiKey: e.target.value,
                          testSuccessMessage: null,
                          testError: null,
                        })
                      }
                      placeholder={p.placeholder}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-mono"
                    />
                    {config.apiKey && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateProviderConfig(p.id, {
                            apiKey: "",
                            testSuccessMessage: null,
                            testError: null,
                          });
                          handleSaveAll();
                        }}
                        className="text-xs border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Model Selection with Persistent Live List & Refresh Button */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-indigo-500" />
                      <span>Text Generation Models ({p.name}):</span>
                    </label>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={config.isFetchingModels}
                      onClick={() => handleFetchLiveModels(p.id)}
                      className="h-6 text-[11px] gap-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2"
                    >
                      <RefreshCw className={`h-3 w-3 ${config.isFetchingModels ? "animate-spin" : ""}`} />
                      <span>{config.isFetchingModels ? "Fetching API Models..." : "🔄 Refresh Live Models via API"}</span>
                    </Button>
                  </div>

                  {/* Grid of Available Models */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {config.availableModels.slice(0, 12).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          updateProviderConfig(p.id, { selectedModel: m.id });
                        }}
                        className={`rounded-lg border p-2.5 text-left transition-all text-xs ${
                          config.selectedModel === m.id
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-white font-medium ring-1 ring-indigo-500"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {m.name || m.id}
                          </span>
                          {m.isLatest && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">
                              ★ Flagship
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {m.description}
                          </div>
                        )}
                      </button>
                    ))}

                    {/* Option for Custom Model ID */}
                    <button
                      type="button"
                      onClick={() => updateProviderConfig(p.id, { selectedModel: "custom" })}
                      className={`rounded-lg border p-2.5 text-left transition-all text-xs ${
                        config.selectedModel === "custom"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-white font-medium ring-1 ring-indigo-500"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold text-slate-900 dark:text-white">
                        + Custom Model ID...
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Enter any specific model</div>
                    </button>
                  </div>

                  {/* Custom Model Input */}
                  {config.selectedModel === "custom" && (
                    <div className="pt-1.5 space-y-1 animate-in fade-in-0">
                      <Input
                        value={config.customModel}
                        onChange={(e) => updateProviderConfig(p.id, { customModel: e.target.value })}
                        placeholder="e.g. gpt-5.6-sol, gemini-3.7-flash, etc."
                        className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-mono h-8"
                      />
                    </div>
                  )}
                </div>

                {/* Feedback Alerts */}
                {config.testSuccessMessage && (
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 animate-in fade-in-0">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold">{config.testSuccessMessage}</span>
                  </div>
                )}

                {config.testError && (
                  <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 p-3 rounded-xl flex items-start gap-2 animate-in fade-in-0">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-semibold">{config.testError}</div>
                      {p.id === "openai" && (
                        <p className="text-[11px] opacity-90">
                          Note: OpenAI keys start with <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">sk-proj-...</code> or <code className="bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">sk-...</code>. Please ensure your OpenAI project has active credits and permission.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions per Provider */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <Button
                    size="sm"
                    disabled={config.isTesting || !config.apiKey}
                    onClick={() => handleTestProviderKey(p.id)}
                    className="text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 gap-1.5"
                    variant="outline"
                  >
                    {config.isTesting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                    )}
                    <span>{config.isTesting ? "Testing..." : `Test ${p.name} Connection`}</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleSaveAll()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Save {p.name} Settings</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Phase 4: Integrations & Automation Hub */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Puzzle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.integrations.title}</span>
            <Badge variant="purple" className="text-[10px]">Phase 4</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.integrations.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Telegram Notifications */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    <Send className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.integrations.telegramTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.integrations.telegramDesc}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {t.integrations.botTokenLabel}
                </label>
                <Input
                  type="password"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder={t.integrations.botTokenPlaceholder}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {t.integrations.chatIdLabel}
                </label>
                <Input
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder={t.integrations.chatIdPlaceholder}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>

              {telegramSuccess && (
                <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{telegramSuccess}</span>
                </div>
              )}

              {telegramError && (
                <div className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/30 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{telegramError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isTestingTelegram || !telegramBotToken || !telegramChatId}
                  onClick={handleTestTelegram}
                  className="text-xs gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {isTestingTelegram ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3 text-sky-500" />
                  )}
                  <span>{t.integrations.testTelegramBtn}</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSaveTelegram}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{t.common.saveChanges}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Card 2: Chrome Extension (LinkedIn 1-Click Saver) */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    🧩
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.integrations.extensionTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.integrations.extensionDesc}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white">Quick 3-Step Setup:</div>
              <div className="space-y-1 text-[11px] leading-relaxed">
                <div>{t.integrations.extensionInstallStep1}</div>
                <div>{t.integrations.extensionInstallStep2}</div>
                <div>{t.integrations.extensionInstallStep3}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Manifest V3 Unpacked Ready</span>
              <Badge variant="success" className="text-[10px]">
                Ready in repo /extension
              </Badge>
            </div>
          </Card>

          {/* Card 3: Progressive Web App & Web Push Notifications */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4 shadow-xs md:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.pwa.pushNotifications}
                  </h3>
                  {isInstalled ? (
                    <Badge variant="success" className="text-[10px]">
                      PWA Standalone
                    </Badge>
                  ) : canInstall ? (
                    <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800">
                      Installable
                    </Badge>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t.pwa.pushDesc}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canInstall && !isInstalled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={installApp}
                    className="text-xs h-8 gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t.pwa.installButton}</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Browser Push Alerts Status</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {pushPermission === "granted"
                    ? t.pwa.pushEnabled
                    : "Push notifications are currently disabled in your browser."}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {pushPermission === "granted" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTestingPush}
                    onClick={handleTestPushNotification}
                    className="text-xs h-8 gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {isTestingPush ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Bell className="h-3.5 w-3.5 text-indigo-500" />
                    )}
                    <span>{t.pwa.testPush}</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={requestPushPermission}
                    className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5 shadow-xs"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    <span>{t.pwa.enablePush}</span>
                  </Button>
                )}
              </div>
            </div>

            {pushSuccess && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{pushSuccess}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
