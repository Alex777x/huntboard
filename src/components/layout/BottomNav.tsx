"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  FileText,
  Calendar,
  User,
} from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    {
      href: "/dashboard",
      label: t.pwa.bottomNav.dashboard,
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/applications",
      label: t.pwa.bottomNav.applications,
      icon: KanbanSquare,
      isActive: pathname.startsWith("/applications"),
    },
    {
      href: "/cv",
      label: t.pwa.bottomNav.cv,
      icon: FileText,
      isActive: pathname.startsWith("/cv"),
    },
    {
      href: "/calendar",
      label: t.pwa.bottomNav.calendar,
      icon: Calendar,
      isActive: pathname.startsWith("/calendar"),
    },
    {
      href: "/profile",
      label: t.pwa.bottomNav.profile,
      icon: User,
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/settings"),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg shadow-black/5"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[3.5rem] py-1 px-2 rounded-xl transition-all duration-150 relative ${
                item.isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-normal"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform duration-150 ${
                    item.isActive ? "scale-110" : ""
                  }`}
                />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[4.5rem]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
