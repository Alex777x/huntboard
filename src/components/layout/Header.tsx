"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Globe,
  Menu,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/I18nProvider";
import { useMobileNav } from "@/components/providers/MobileNavProvider";
import { usePwa } from "@/components/pwa/PwaProvider";

export function Header() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();
  const { toggle } = useMobileNav();
  const { canInstall, isInstalled, installApp } = usePwa();

  const isRecruiter = pathname?.startsWith("/recruiter");
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 px-4 md:px-6 backdrop-blur-xl transition-colors duration-200 gap-3">
      {/* Left: Mobile Hamburger & Search Bar */}
      <div className="flex w-full max-w-md items-center gap-2">
        {/* Mobile Hamburger Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="md:hidden h-9 w-9 p-0 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="search"
            placeholder={t.common.searchPlaceholder}
            className="pl-9 pr-4 bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Recruiter / Seeker / Admin Mode Pill */}
        {isRecruiter ? (
          <Badge
            variant="purple"
            className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 text-[11px] font-semibold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            <span>{t.nav.employerMode}</span>
          </Badge>
        ) : isAdmin ? (
          <Badge
            variant="destructive"
            className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 text-[11px] font-semibold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
            <span>{t.nav.adminMode}</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="hidden sm:flex items-center gap-1.5 py-1 px-2.5 bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>{t.nav.seekerMode}</span>
          </Badge>
        )}

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 gap-1 uppercase font-bold"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{locale}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 text-xs">
            <DropdownMenuItem
              onClick={() => setLocale("en")}
              className={`cursor-pointer ${locale === "en" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}
            >
              🇺🇸 English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale("ru")}
              className={`cursor-pointer ${locale === "ru" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}
            >
              🇷🇺 Русский
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLocale("pl")}
              className={`cursor-pointer ${locale === "pl" ? "font-bold text-indigo-600 dark:text-indigo-400" : ""}`}
            >
              🇵🇱 Polski
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* PWA Install Quick Button (shown if installable and not yet standalone) */}
        {canInstall && !isInstalled && (
          <Button
            size="sm"
            variant="outline"
            onClick={installApp}
            className="hidden sm:inline-flex h-8 px-2.5 text-xs font-semibold gap-1.5 border-indigo-200 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 shadow-xs"
            title={t.pwa.installApp}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{t.pwa.installApp}</span>
          </Button>
        )}

        {/* Theme Toggle (Dark/Light) */}
        <ThemeToggle />

        {/* User Profile Quick Link */}
        <Link href={isRecruiter ? "/recruiter/verify" : "/profile"}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm hover:ring-2 hover:ring-indigo-400 transition-all cursor-pointer">
            {isRecruiter ? "R" : "AL"}
          </div>
        </Link>
      </div>
    </header>
  );
}
