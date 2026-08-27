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
  HelpCircle,
  Loader2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types/database";
import { InterviewPrepResponse } from "@/lib/ai/types";
import { useI18n } from "@/components/providers/I18nProvider";

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
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<"cover-letter" | "interview-prep">("cover-letter");
  const [tone, setTone] = React.useState<"professional" | "enthusiastic" | "concise">("professional");
  const [isGeneratingCL, setIsGeneratingCL] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Interview Prep State
  const [isGeneratingPrep, setIsGeneratingPrep] = React.useState(false);
  const [prepData, setPrepData] = React.useState<InterviewPrepResponse | null>(null);

  const getSavedAISettings = () => {
    if (typeof window === "undefined") return { apiKey: "", provider: "openai", model: "gpt-4o" };
    return {
      apiKey: localStorage.getItem("huntboard_api_key") || "",
      provider: localStorage.getItem("huntboard_ai_provider") || "openai",
      model: localStorage.getItem("huntboard_ai_model") || "gpt-4o",
    };
  };

  const handleGenerateCoverLetter = async () => {
    if (!application) return;

    setIsGeneratingCL(true);
    setError(null);

    try {
      const { apiKey, provider, model } = getSavedAISettings();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cover-letter",
          apiKey,
          provider,
          model,
          jobTitle: application.job_title,
          companyName: application.company_id,
          jobDescription: application.notes || "",
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate Cover Letter");
      }

      const data = await res.json();
      setCoverLetter(data.coverLetter || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate Cover Letter. Please check your AI API key in Settings.");
    } finally {
      setIsGeneratingCL(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
    if (!application) return;

    setIsGeneratingPrep(true);
    try {
      const { apiKey, provider, model } = getSavedAISettings();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview-prep",
          apiKey,
          provider,
          model,
          jobTitle: application.job_title,
          companyName: application.company_id,
          jobDescription: application.notes || "",
        }),
      });

      if (!res.ok) throw new Error("Failed to generate Interview Prep");
      const data = await res.json();
      setPrepData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsGeneratingPrep(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && application) {
      handleGenerateCoverLetter();
      setPrepData(null);
    }
  }, [isOpen, application, tone]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.applications.generateCoverLetter}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {application?.job_title} at <span className="font-semibold text-slate-700 dark:text-slate-200">{application?.company_id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("cover-letter")}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "cover-letter"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t.applications.coverLetterTab}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("interview-prep");
              if (!prepData) handleGenerateInterviewPrep();
            }}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === "interview-prep"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{t.applications.interviewPrepTab}</span>
          </button>
        </div>

        {/* Tab 1: Cover Letter */}
        {activeTab === "cover-letter" && (
          <div className="space-y-4">
            {/* Tone Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.applications.toneLabel}</div>
              <div className="flex gap-2">
                {[
                  { id: "professional", label: t.applications.toneProfessional },
                  { id: "enthusiastic", label: t.applications.toneEnthusiastic },
                  { id: "concise", label: t.applications.toneConcise },
                ].map((tOpt) => (
                  <button
                    key={tOpt.id}
                    onClick={() => {
                      setTone(tOpt.id as any);
                    }}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium capitalize transition-all ${
                      tone === tOpt.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {tOpt.label}
                  </button>
                ))}
              </div>
              <Button
                size="sm"
                onClick={handleGenerateCoverLetter}
                disabled={isGeneratingCL}
                className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
              >
                {isGeneratingCL ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>{isGeneratingCL ? t.applications.generatingCL : t.applications.regenerateCL}</span>
              </Button>
            </div>

            {/* Result Area */}
            <div className="space-y-2">
              {error && (
                <div className="text-red-700 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-500/30">
                  {error}
                </div>
              )}
              <textarea
                rows={12}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans shadow-xs"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
              <span className="text-[11px] text-slate-500">
                {t.applications.clickToTweak}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="text-xs"
                >
                  {t.common.close}
                </Button>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? t.applications.copiedClipboard : t.applications.copyClipboard}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interview Prep */}
        {activeTab === "interview-prep" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {t.applications.prepOverview}
              </p>
              <Button
                size="sm"
                onClick={handleGenerateInterviewPrep}
                disabled={isGeneratingPrep}
                className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
              >
                {isGeneratingPrep ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                <span>{isGeneratingPrep ? t.applications.preparingPrep : t.applications.regeneratePrep}</span>
              </Button>
            </div>

            {isGeneratingPrep ? (
              <div className="flex items-center justify-center py-12 gap-2 text-xs text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                <span>{t.applications.preparingPrep}</span>
              </div>
            ) : prepData ? (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
                {prepData.overview && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/20 font-medium">
                    {prepData.overview}
                  </div>
                )}

                {prepData.questions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          q.category === "system-design"
                            ? "purple"
                            : q.category === "technical"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {q.category}
                      </Badge>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Question {idx + 1}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                      &quot;{q.question}&quot;
                    </h4>

                    {q.suggestedTalkingPoints && q.suggestedTalkingPoints.length > 0 && (
                      <div className="pt-1.5 space-y-1">
                        <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                          {t.applications.suggestedTalkingPoints}
                        </span>
                        <ul className="list-disc ml-4 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 leading-relaxed">
                          {q.suggestedTalkingPoints.map((point, pIdx) => (
                            <li key={pIdx}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                {t.common.close}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
