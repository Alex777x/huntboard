"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Globe,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
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

export function Header({ onNewApplication }: { onNewApplication?: () => void }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-6 backdrop-blur-xl transition-colors duration-200">
      {/* Search Bar */}
      <div className="flex w-full max-w-md items-center">
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
      <div className="flex items-center gap-2.5">
        {/* Recruiter / Seeker Mode Pill */}
        <Badge
          variant="outline"
          className="hidden sm:flex items-center gap-1 py-1 px-2.5 bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Job Seeker Mode
        </Badge>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 gap-1.5 uppercase font-bold"
            >
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{locale}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocale("en")}>
              🇬🇧 English (EN)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("ru")}>
              🇷🇺 Русский (RU)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocale("pl")}>
              🇵🇱 Polski (PL)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Quick Add Button */}
        {onNewApplication ? (
          <Button
            onClick={onNewApplication}
            size="sm"
            className="ml-1 gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>{t.common.newApplication}</span>
          </Button>
        ) : (
          <Link href="/applications">
            <Button
              size="sm"
              className="ml-1 gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 text-xs font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>{t.common.newApplication}</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
