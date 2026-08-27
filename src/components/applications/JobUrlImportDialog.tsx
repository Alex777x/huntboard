"use client";

import * as React from "react";
import {
  X,
  Link as LinkIcon,
  Sparkles,
  Check,
  Building,
  Briefcase,
  Loader2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Application } from "@/types/database";
import { useI18n } from "@/components/providers/I18nProvider";

interface JobUrlImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJobImported: (job: Application) => void;
}

export function JobUrlImportDialog({
  isOpen,
  onClose,
  onJobImported,
}: JobUrlImportDialogProps) {
  const { t } = useI18n();
  const [url, setUrl] = React.useState("");
  const [isParsing, setIsParsing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseAndImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsParsing(true);
    setError(null);

    try {
      const res = await fetch("/api/integrations/extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "parse-url",
          url: url.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to parse URL");
      const data = await res.json();

      if (data.ok && data.job) {
        onJobImported(data.job);
        onClose();
      } else {
        throw new Error(data.error || "Failed to extract job");
      }
    } catch (err: any) {
      setError(t.integrations.importedError);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.integrations.importJobUrl}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.integrations.importJobUrlDesc}
        </p>

        <form onSubmit={handleParseAndImport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Job URL (LinkedIn / Indeed / Glassdoor) *
            </label>
            <Input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.linkedin.com/jobs/view/..."
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-700 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isParsing}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              {isParsing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t.integrations.parsingUrl}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.integrations.parseUrlBtn}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
