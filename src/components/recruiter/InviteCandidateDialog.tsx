"use client";

import * as React from "react";
import {
  X,
  Send,
  Sparkles,
  Building,
  Briefcase,
  User,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/I18nProvider";

interface CandidateRecord {
  id: string;
  name: string;
  currentRole: string;
  desiredRole: string;
  location: string;
  skills: string[];
}

interface InviteCandidateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: CandidateRecord | null;
  onInviteSent?: (candidateId: string, jobId: string, message: string) => void;
}

export function InviteCandidateDialog({
  isOpen,
  onClose,
  candidate,
  onInviteSent,
}: InviteCandidateDialogProps) {
  const { t } = useI18n();
  const [selectedJob, setSelectedJob] = React.useState("job-1");
  const [message, setMessage] = React.useState(
    "Hi! We came across your profile on HuntBoard and were very impressed with your background in Next.js 15, TypeScript and PostgreSQL. We would love to invite you to interview for our Senior Fullstack position at Stripe!"
  );
  const [sent, setSent] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout>(undefined);

  React.useEffect(() => {
    if (candidate) {
      setMessage(
        `Hi ${candidate.name}! We came across your profile on HuntBoard and were very impressed with your background in ${candidate.skills.slice(0, 3).join(", ")}. We would love to invite you for a conversation regarding our engineering opening!`
      );
      setSent(false);
    }
  }, [candidate, isOpen]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOpen || !candidate) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    onInviteSent?.(candidate.id, selectedJob, message);

    // Try sending Telegram notification if user configured it
    try {
      const botToken = localStorage.getItem("huntboard_telegram_bot_token");
      const chatId = localStorage.getItem("huntboard_telegram_chat_id");

      if (botToken && chatId) {
        await fetch("/api/integrations/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "notify-invite",
            botToken,
            chatId,
            inviteData: {
              recruiterName: "Jessica Miller (Verified Recruiter)",
              companyName: "Stripe",
              role: selectedJob === "job-1" ? "Senior Fullstack Engineer" : "Staff Engineer",
              message,
              inviteUrl: `${window.location.origin}/invites`,
            },
          }),
        });
      }
    } catch (err) {
      console.error("Telegram invite dispatch error:", err);
    }

    setSent(true);
    timerRef.current = setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-600 dark:text-purple-400" />
              <span>{t.recruiter.sendInvite}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inviting <span className="text-slate-900 dark:text-white font-semibold">{candidate.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.recruiter.inviteDialog.sentTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.recruiter.inviteDialog.sentDesc}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.inviteDialog.targetVacancy}
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="job-1">Senior Fullstack Engineer (Payments) — Stripe ($150k - $185k)</option>
                <option value="job-2">Frontend Architect (Design Systems) — Stripe ($160k - $195k)</option>
                <option value="job-3">Staff Backend Engineer (Postgres) — Stripe ($190k - $230k)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.inviteDialog.personalizedNote}
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t.recruiter.sendInvite}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
