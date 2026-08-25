"use client";

import * as React from "react";
import {
  FileText,
  Sparkles,
  Printer,
  Download,
  Upload,
  Bot,
  Copy,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Eye,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CVPreview } from "@/components/cv/CVPreview";
import { CVFormEditor } from "@/components/cv/CVFormEditor";
import { defaultCVData } from "@/lib/cv/defaultCV";
import { CVData } from "@/types/cv";
import { useI18n } from "@/components/providers/I18nProvider";

export function CVManager() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<"ats" | "editor" | "versions">("editor");
  const [cvData, setCvData] = React.useState<CVData>(defaultCVData);
  const [jobUrl, setJobUrl] = React.useState("https://boards.greenhouse.io/stripe/jobs/482910");
  const [jobDescription, setJobDescription] = React.useState(
    "We are looking for a Senior Fullstack Engineer with 5+ years experience in Next.js 15, TypeScript, PostgreSQL, Tailwind CSS and building scalable REST APIs..."
  );

  // ATS State
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [atsResult, setAtsResult] = React.useState<{
    score: number;
    matched: string[];
    missing: string[];
    suggestions: string[];
  }>({
    score: 92,
    matched: ["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS v4", "Docker", "React 19"],
    missing: ["GraphQL Federation", "Redis Caching"],
    suggestions: [
      "Quantify your performance improvements in previous jobs (e.g. 'Reduced latency by 35%').",
      "Mention distributed queue experience (BullMQ or RabbitMQ) if applicable.",
    ],
  });

  const handleRunATS = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAtsResult({
        score: Math.floor(Math.random() * 10) + 88,
        matched: ["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS", "REST APIs"],
        missing: ["Kubernetes"],
        suggestions: [
          "Add measurable team impact for your senior engineering tenure at TechCorp.",
        ],
      });
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.cv.title}
            <Badge variant="purple" className="text-xs">
              Form-Based ATS Engine
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.cv.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => window.print()}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
          >
            <Printer className="h-4 w-4" />
            <span>{t.cv.exportPdf}</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-6 no-print">
        <button
          onClick={() => setActiveTab("editor")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "editor"
              ? "border-indigo-500 text-indigo-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>Form Editor & Live Preview</span>
        </button>
        <button
          onClick={() => setActiveTab("ats")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "ats"
              ? "border-indigo-500 text-indigo-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>ATS Benchmark</span>
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "versions"
              ? "border-indigo-500 text-indigo-300 font-semibold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>CV Versions (3)</span>
        </button>
      </div>

      {/* Tab: Form Editor & Live Preview */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left: Interactive Form */}
          <div className="no-print space-y-4">
            <CVFormEditor cvData={cvData} onChange={setCvData} />
          </div>

          {/* Right: Printable ATS Document Sheet */}
          <div className="overflow-x-auto flex justify-center py-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 shadow-inner">
            <CVPreview data={cvData} />
          </div>
        </div>
      )}

      {/* Tab: ATS Benchmark */}
      {activeTab === "ats" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          {/* Vacancy input */}
          <div className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/60 p-5">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-400" />
                Target Job Vacancy
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Paste job requirements to compare against your active CV.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Job Link
                  </label>
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="text-xs bg-slate-950 border-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 mb-1 block">
                    Requirements Text
                  </label>
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  onClick={handleRunATS}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isAnalyzing ? "Analyzing Match..." : "Run ATS Benchmark (5 tokens)"}</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Report */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-indigo-500/20 bg-slate-900/80 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Overall Match Score
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      {atsResult.score >= 90 ? "Excellent" : "Strong Match"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-white">
                      {atsResult.score}<span className="text-xl text-slate-500">/100</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-medium">
                      High ATS pass rate probability
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setActiveTab("editor")}
                  variant="secondary"
                  size="sm"
                  className="text-xs border-slate-700 gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Apply AI Edits to CV</span>
                </Button>
              </div>

              {/* Matched & Missing Keywords */}
              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Matched Keywords ({atsResult.matched.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {atsResult.matched.map((kw) => (
                      <Badge key={kw} variant="success" className="text-xs py-0.5 px-2">
                        ✓ {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                {atsResult.missing.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Missing Keywords to Consider
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.missing.map((kw) => (
                        <Badge key={kw} variant="warning" className="text-xs py-0.5 px-2">
                          + {kw}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Suggestions */}
                <div className="pt-2 space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    AI Suggestions
                  </h4>
                  {atsResult.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Versions */}
      {activeTab === "versions" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
          {[
            {
              id: "v1",
              title: "Fullstack General CV",
              role: "Senior Fullstack Engineer",
              date: "Updated Aug 24",
              isDefault: true,
            },
            {
              id: "v2",
              title: "Frontend & Architecture Focused",
              role: "Frontend Systems Engineer",
              date: "Updated Aug 22",
              isDefault: false,
            },
            {
              id: "v3",
              title: "AI Platform & Backend CV",
              role: "Platform Engineer",
              date: "Updated Aug 18",
              isDefault: false,
            },
          ].map((v) => (
            <Card key={v.id} className="border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{v.title}</h3>
                  <p className="text-xs text-slate-400">{v.role}</p>
                </div>
                {v.isDefault && (
                  <Badge variant="purple" className="text-[10px]">
                    Default
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span>{v.date}</span>
                <Button
                  onClick={() => setActiveTab("editor")}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-indigo-400 hover:text-white"
                >
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
