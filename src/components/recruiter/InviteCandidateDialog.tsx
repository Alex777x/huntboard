"use client";

import * as React from "react";
import {
  X,
  Send,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

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
  const [jobs, setJobs] = React.useState<
    Array<{
      id: string;
      title: string;
      company_name: string;
      salary_min: number | null;
      salary_max: number | null;
      salary_currency: string | null;
    }>
  >([]);
  const [selectedJob, setSelectedJob] = React.useState("");
  const [message, setMessage] = React.useState(
    "Hi! We came across your profile on HuntBoard and love your engineering background. We'd love to invite you for an initial chat regarding our open position."
  );
  const [sent, setSent] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    async function fetchJobs() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("recruiter_jobs")
            .select("id, title, company_name, salary_min, salary_max, salary_currency")
            .eq("recruiter_id", user.id)
            .eq("status", "active")
            .limit(50);

          if (data && data.length > 0) {
            setJobs(data as any);
            setSelectedJob(data[0].id);
            return;
          }
        }

        // Fallback: load any active platform jobs
        const { data: anyJobs } = await supabase
          .from("recruiter_jobs")
          .select("id, title, company_name, salary_min, salary_max, salary_currency")
          .eq("status", "active")
          .limit(20);

        if (anyJobs && anyJobs.length > 0) {
          setJobs(anyJobs as any);
          setSelectedJob(anyJobs[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch jobs for invite dialog:", err);
      }
    }

    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (candidate) {
      setMessage(
        `Hi ${candidate.name}! We came across your profile on HuntBoard and were very impressed with your background in ${candidate.skills.slice(0, 3).join(", ")}. We would love to invite you for a conversation regarding our engineering opening!`
      );
      setSent(false);
      setErrorMessage(null);
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
    setErrorMessage(null);

    if (!selectedJob) {
      setErrorMessage("Please select a target vacancy");
      return;
    }

    onInviteSent?.(candidate.id, selectedJob, message);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: inviteErr } = await supabase.from("invites").insert({
          sender_id: user.id,
          receiver_id: candidate.id,
          recruiter_job_id: selectedJob,
          message,
          status: "pending",
        });

        if (inviteErr) {
          console.error("DB invite dispatch error:", inviteErr);
          setErrorMessage(inviteErr.message);
          return;
        }

        // Dispatch candidate Telegram notification via server API route
        fetch("/api/recruiter/invites/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId: candidate.id,
            jobId: selectedJob,
            message,
          }),
        }).catch((err) => console.error("Notification dispatch error:", err));
      }
    } catch (dbErr: any) {
      console.error("DB invite dispatch error:", dbErr);
      setErrorMessage(dbErr?.message || "Failed to dispatch invite");
      return;
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

        {errorMessage && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg">
            {errorMessage}
          </div>
        )}

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
                {jobs.length > 0 ? (
                  jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company_name}{" "}
                      {j.salary_min && j.salary_max
                        ? `($${Math.round(j.salary_min / 1000)}k - $${Math.round(j.salary_max / 1000)}k)`
                        : ""}
                    </option>
                  ))
                ) : (
                  <option value="">No active vacancies found</option>
                )}
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
