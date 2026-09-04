"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwa } from "./PwaProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export function InstallPromptBanner() {
  const { canInstall, isInstalled, isIOS, installApp } = usePwa();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check if user previously dismissed prompt
    const isDismissed = localStorage.getItem("huntboard_pwa_dismissed") === "true";
    if (!isDismissed) {
      setDismissed(false);
    }
  }, []);

  // Do not display if already installed, dismissed, or installation not supported
  if (isInstalled || dismissed || (!canInstall && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("huntboard_pwa_dismissed", "true");
  };

  const handleInstallClick = async () => {
    await installApp();
    handleDismiss();
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-900/50 shadow-2xl shadow-indigo-500/10 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.pwa.installPromptTitle}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {t.pwa.installPromptDesc}
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors shrink-0"
          aria-label={t.pwa.dismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isIOS ? (
        // iOS Safari Instructions
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <Share className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>1. {t.pwa.iosShareHint}</span>
          </div>
          <div className="flex items-center gap-2">
            <PlusSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>2. {t.pwa.iosAddHomeHint}</span>
          </div>
        </div>
      ) : (
        // Standard Android / Desktop 1-Click Install Button
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-xs h-8 text-slate-600 dark:text-slate-400"
          >
            {t.pwa.dismiss}
          </Button>
          <Button
            size="sm"
            onClick={handleInstallClick}
            className="text-xs h-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5 shadow-xs shadow-indigo-500/25"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.pwa.installButton}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
