"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { usePwa } from "./PwaProvider";
import { useI18n } from "@/components/providers/I18nProvider";

export function OfflineIndicator() {
  const { isOnline } = usePwa();
  const { t } = useI18n();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowRestored(false);
    } else if (wasOffline) {
      // Temporarily flash restored banner when network recovers
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) {
    return null;
  }

  if (showRestored) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium shadow-lg shadow-emerald-500/20 animate-in fade-in-0 slide-in-from-top-2 duration-300">
        <Wifi className="h-3.5 w-3.5 animate-pulse" />
        <span>{t.pwa.onlineRestored}</span>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 text-slate-950 dark:bg-amber-400 text-xs font-semibold shadow-lg shadow-amber-500/20 animate-in fade-in-0 slide-in-from-top-2 duration-300">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>{t.pwa.offlineBadge}</span>
      <span className="opacity-75 hidden sm:inline">— {t.pwa.offlineDesc}</span>
    </div>
  );
}
