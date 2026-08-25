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
  const [selectedJob, setSelectedJob] = React.useState("job-1");
  const [message, setMessage] = React.useState(
    "Hi! We came across your profile on HuntBoard and were very impressed with your background in Next.js 15, TypeScript and PostgreSQL. We would love to invite you to interview for our Senior Fullstack position at Stripe!"
  );
  const [sent, setSent] = React.useState(false);

  React.useEffect(() => {
    if (candidate) {
      setMessage(
        `Hi ${candidate.name}! We came across your profile on HuntBoard and were very impressed with your background in ${candidate.skills.slice(0, 3).join(", ")}. We would love to invite you for a conversation regarding our engineering opening!`
      );
      setSent(false);
    }
  }, [candidate, isOpen]);

  if (!isOpen || !candidate) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onInviteSent?.(candidate.id, selectedJob, message);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-purple-400" />
              Direct Interview Invitation
            </h2>
            <p className="text-xs text-slate-400">
              Inviting <span className="text-white font-semibold">{candidate.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="py-8 text-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Invitation Sent!</h3>
            <p className="text-xs text-slate-400">
              The candidate will receive this invite in their private HuntBoard inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Target Vacancy *
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="job-1">Senior Fullstack Engineer (Payments) — Stripe ($150k - $185k)</option>
                <option value="job-2">Frontend Architect (Design Systems) — Stripe ($160k - $195k)</option>
                <option value="job-3">Staff Backend Engineer (Postgres) — Stripe ($190k - $230k)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Personalized Invite Note
              </label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-purple-600/25"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Direct Invitation</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
