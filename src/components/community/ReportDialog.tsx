"use client";

import * as React from "react";
import { X, Flag, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle?: string;
  onReportSubmitted?: (reason: string) => void;
}

export function ReportDialog({
  isOpen,
  onClose,
  postTitle,
  onReportSubmitted,
}: ReportDialogProps) {
  const [reason, setReason] = React.useState("Misleading salary or job requirements");
  const [details, setDetails] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportSubmitted?.(`${reason}: ${details}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">Report Job Listing</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <Check className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Report Received</h4>
            <p className="text-xs text-slate-400">
              Thank you for keeping the community board accurate and free of spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <p className="text-xs text-slate-300">
              Reporting: <strong className="text-white">{postTitle}</strong>
            </p>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              >
                <option value="Broken link or expired vacancy">Broken link or expired vacancy</option>
                <option value="Misleading salary or job requirements">Misleading salary or requirements</option>
                <option value="Spam / Scammer / Suspicious recruiter">Spam / Suspicious posting</option>
                <option value="Duplicate post">Duplicate post</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Additional Context</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Details on what is inaccurate..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-400">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
