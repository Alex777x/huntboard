"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaContextType {
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  installApp: () => Promise<void>;
  pushPermission: NotificationPermission;
  requestPushPermission: () => Promise<boolean>;
  sendTestPush: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | undefined>(undefined);

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // 1. Check if running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // 3. Setup online / offline network state listeners
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 4. Intercept beforeinstallprompt for Android & Desktop Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Track app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    // 6. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check push permission state
          if ("Notification" in window) {
            setPushPermission(Notification.permission);
          }
        })
        .catch((err) => {
          console.warn("PWA Service Worker registration skipped:", err);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Trigger native PWA install prompt
  const installApp = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Install prompt error:", err);
    }
  };

  // Request Web Push Notification Permission
  const requestPushPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      return permission === "granted";
    } catch {
      return false;
    }
  };

  // Trigger test push notification via active Service Worker
  const sendTestPush = async () => {
    if (pushPermission !== "granted") {
      const granted = await requestPushPermission();
      if (!granted) return;
    }

    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && "showNotification" in registration) {
        await (registration as any).showNotification(t.pwa.testPushTitle, {
          body: t.pwa.testPushBody,
          icon: "/icon.svg",
          badge: "/icon.svg",
          vibrate: [100, 50, 100],
          data: { url: "/calendar" },
        });
      }
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        canInstall,
        isInstalled,
        isIOS,
        installApp,
        pushPermission,
        requestPushPermission,
        sendTestPush,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa(): PwaContextType {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
}
