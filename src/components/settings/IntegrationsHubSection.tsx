"use client";

import * as React from "react";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Puzzle,
  Bell,
  Download,
  Smartphone,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/I18nProvider";
import { usePwa } from "@/components/pwa/PwaProvider";

interface IntegrationsHubSectionProps {
  telegramBotToken: string;
  setTelegramBotToken: (v: string) => void;
  telegramChatId: string;
  setTelegramChatId: (v: string) => void;
  isTestingTelegram: boolean;
  telegramSuccess: string | null;
  telegramError: string | null;
  onTestTelegram: () => void;
  onSaveTelegram: () => void;
}

export function IntegrationsHubSection({
  telegramBotToken,
  setTelegramBotToken,
  telegramChatId,
  setTelegramChatId,
  isTestingTelegram,
  telegramSuccess,
  telegramError,
  onTestTelegram,
  onSaveTelegram,
}: IntegrationsHubSectionProps) {
  const { t } = useI18n();
  const {
    isInstalled,
    canInstall,
    installApp,
    pushPermission,
    requestPushPermission,
    sendTestPush,
  } = usePwa();
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

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>{t.integrations.title}</span>
          <Badge variant="purple" className="text-[10px]">
            Phase 4
          </Badge>
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
                onClick={onTestTelegram}
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
                onClick={onSaveTelegram}
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
            <div className="font-semibold text-slate-900 dark:text-white">
              Quick 3-Step Setup:
            </div>
            <div className="space-y-1 text-[11px] leading-relaxed">
              <div>{t.integrations.extensionInstallStep1}</div>
              <div>{t.integrations.extensionInstallStep2}</div>
              <div>{t.integrations.extensionInstallStep3}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Manifest V3 Unpacked Ready
            </span>
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
                  <Badge
                    variant="outline"
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                  >
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
  );
}
