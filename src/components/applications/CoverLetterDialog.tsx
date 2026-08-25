"use client";

import * as React from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileText,
  Building2,
  Briefcase,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Application } from "@/types/database";

interface CoverLetterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
}

export function CoverLetterDialog({
  isOpen,
  onClose,
  application,
}: CoverLetterDialogProps) {
  const [tone, setTone] = React.useState<"professional" | "enthusiastic" | "concise">("professional");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && application) {
      handleGenerate();
    }
  }, [isOpen, application]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: "Senior Fullstack Engineer with 6+ years in Next.js 15, TypeScript, PostgreSQL, and building AI tools.",
          jobTitle: application?.job_title || "Fullstack Engineer",
          companyName: application?.company_id || "Target Company",
          jobDescription: application?.job_description || "Building scalable modern cloud applications.",
          tone,
        }),
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter || "");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Tailored Cover Letter
            </h2>
            <p className="text-xs text-slate-400">
              Generated specifically for {application?.job_title} at {application?.company_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-300 font-medium">Select Tone:</div>
          <div className="flex gap-2">
            {(["professional", "enthusiastic", "concise"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-all ${
                  tone === t
                    ? "border-indigo-500 bg-indigo-950/40 text-indigo-300"
                    : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>{isGenerating ? "Generating..." : "Regenerate (10 tokens)"}</span>
          </Button>
        </div>

        {/* Result Area */}
        <div className="space-y-2">
          <textarea
            rows={12}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <span className="text-[11px] text-slate-500">
            Click text to tweak before copying
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-400"
            >
              Close
            </Button>
            <Button
              onClick={handleCopy}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied to Clipboard!" : "Copy to Clipboard"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
