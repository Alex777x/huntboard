"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";

export default function NotFound() {
  const { locale } = useI18n();

  const text = {
    en: {
      code: "404",
      title: "Page Not Found",
      description:
        "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.",
      home: "Return to Dashboard",
      search: "Browse Community Jobs",
    },
    ru: {
      code: "404",
      title: "Страница не найдена",
      description:
        "Страница, которую вы ищете, возможно, была удалена, переименована или временно недоступна.",
      home: "Вернуться на дашборд",
      search: "Посмотреть вакансии сообщества",
    },
    pl: {
      code: "404",
      title: "Nie znaleziono strony",
      description:
        "Strona, której szukasz, mogła zostać usunięta, zmieniła nazwę lub jest tymczasowo niedostępna.",
      home: "Wróć do pulpitu",
      search: "Przeglądaj oferty społeczności",
    },
  }[locale] || {
    code: "404",
    title: "Page Not Found",
    description: "The page you are looking for does not exist.",
    home: "Return to Dashboard",
    search: "Browse Community Jobs",
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 shadow-inner">
          <span className="text-3xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {text.code}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {text.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {text.description}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
            >
              <Home className="h-4 w-4" />
              <span>{text.home}</span>
            </Button>
          </Link>

          <Link href="/community" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 gap-1.5"
            >
              <Search className="h-4 w-4" />
              <span>{text.search}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
