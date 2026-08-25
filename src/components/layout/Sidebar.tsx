"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Building2,
  Users,
  Calendar,
  Globe,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Zap,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/I18nProvider";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useI18n();

  const seekerNavItems = [
    {
      title: t.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t.nav.applications,
      href: "/applications",
      icon: Briefcase,
      badge: "12",
      badgeVariant: "purple",
    },
    {
      title: t.nav.cv,
      href: "/cv",
      icon: FileText,
    },
    {
      title: t.nav.companies,
      href: "/companies",
      icon: Building2,
    },
    {
      title: t.nav.contacts,
      href: "/contacts",
      icon: Users,
    },
    {
      title: t.nav.calendar,
      href: "/calendar",
      icon: Calendar,
    },
    {
      title: t.nav.community,
      href: "/community",
      icon: Globe,
      badge: "New",
      badgeVariant: "default",
    },
    {
      title: t.nav.invites,
      href: "/invites",
      icon: Users,
      badge: "1 New",
      badgeVariant: "purple",
    },
    {
      title: t.nav.profile,
      href: "/profile",
      icon: Users,
    },
    {
      title: t.nav.settings,
      href: "/settings",
      icon: Settings,
    },
    {
      title: t.nav.feedback,
      href: "/feedback",
      icon: MessageSquare,
    },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-slate-200 backdrop-blur-xl transition-colors duration-200",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 dark:border-slate-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-500/20">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              HuntBoard
            </span>
            <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
              AI
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Job Search Platform</span>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        <nav className="space-y-1">
          {seekerNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-200 dark:border-indigo-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI & Token Balance Card */}
        <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-50/50 dark:bg-gradient-to-b dark:from-indigo-950/40 dark:to-slate-900/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>{t.dashboard.aiTokens}</span>
            </div>
            <Badge variant="purple" className="text-[10px] px-1.5 py-0">
              {t.common.active}
            </Badge>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              150 <span className="text-xs font-normal text-slate-500 dark:text-slate-400">tokens</span>
            </span>
            <Link
              href="/settings"
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 font-medium"
            >
              Add Key <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            ATS Score & Cover Letter ready.
          </p>
        </div>
      </div>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 space-y-2">
        <Link href="/recruiter/jobs">
          <div className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-50 dark:bg-purple-950/20 px-2.5 py-1.5 text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors font-medium">
            <span>Switch to Employer Portal</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </Link>

        <Link
          href="/profile"
          className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-9 w-9 border border-indigo-500/30">
              <AvatarImage src="" />
              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                AL
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white">
                Anatoli L.
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                Software Engineer
              </span>
            </div>
          </div>
          <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
