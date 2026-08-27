"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Coins,
  Flag,
  ArrowLeft,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useI18n } from "@/components/providers/I18nProvider";
import { useMobileNav } from "@/components/providers/MobileNavProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { isOpen, close, toggle } = useMobileNav();

  const navItems = [
    { title: t.admin.usersTitle, href: "/admin/users", icon: Users },
    { title: t.admin.balanceTitle, href: "/admin/balance", icon: Coins },
    { title: t.feedback.title, href: "/admin/feedback", icon: Flag },
  ];

  const renderContent = (isMobile = false) => (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md shadow-purple-600/30">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">HuntBoard</div>
              <Badge variant="purple" className="text-[10px] py-0 px-1.5 font-bold">
                {t.nav.adminConsole}
              </Badge>
            </div>
          </div>

          {isMobile && (
            <button
              onClick={close}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1 text-xs">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile) close();
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                  isActive
                    ? "bg-purple-50 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
        <Link
          href="/dashboard"
          onClick={() => {
            if (isMobile) close();
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 gap-2 bg-white dark:bg-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t.common.backToApp}</span>
          </Button>
        </Link>
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
          <span>Admin v1.0</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex-col md:flex-row">
      {/* Mobile Topbar for Admin */}
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="h-9 w-9 p-0 text-slate-700 dark:text-slate-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.nav.adminConsole}</span>
        </div>
        <ThemeToggle />
      </header>

      {/* 1. Desktop Sticky Admin Sidebar */}
      <aside className="hidden md:flex sticky top-0 h-screen w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-6 flex-col justify-between z-40">
        {renderContent(false)}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in-0">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={close}
            aria-hidden="true"
          />
          <aside className="relative z-50 w-72 max-w-[85vw] flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
