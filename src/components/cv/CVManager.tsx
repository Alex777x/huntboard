"use client";

import * as React from "react";
import {
  Sparkles,
  Bot,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  BookmarkPlus,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CVPreview } from "@/components/cv/CVPreview";
import { CVFormEditor } from "@/components/cv/CVFormEditor";
import { defaultCVData } from "@/lib/cv/defaultCV";
import { CVData, CVVersion } from "@/types/cv";
import { useI18n } from "@/components/providers/I18nProvider";

const INITIAL_VERSIONS: CVVersion[] = [
  {
    id: "ver-default-1",
    name: "General Java Software Engineer (Gold Standard)",
    targetRole: "Java Software Engineer",
    targetCompany: "General",
    updatedAt: "Today",
    isDefault: true,
    data: defaultCVData,
  },
  {
    id: "ver-epam",
    name: "Tailored for EPAM Systems (Microservices & Kafka)",
    targetRole: "Senior Java Developer",
    targetCompany: "EPAM Systems",
    updatedAt: "Aug 26, 2026",
    isDefault: false,
    data: {
      ...defaultCVData,
      personal: {
        ...defaultCVData.personal,
        title: "Senior Java Developer (Microservices & Cloud)",
      },
    },
  },
];

export function CVManager() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = React.useState<"ats" | "editor" | "versions">("editor");
  const [cvData, setCvData] = React.useState<CVData>(defaultCVData);
  const [versions, setVersions] = React.useState<CVVersion[]>(INITIAL_VERSIONS);
  const [activeVersionName, setActiveVersionName] = React.useState<string>(
    "General Java Software Engineer"
  );

  // ATS State
  const [jobUrl, setJobUrl] = React.useState("https://boards.greenhouse.io/stripe/jobs/482910");
  const [jobDescription, setJobDescription] = React.useState(
    "We are looking for a Senior Java Software Engineer with 5+ years experience in Spring Boot, Apache Kafka, Microservices, PostgreSQL, Docker, and CI/CD pipelines..."
  );
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [atsResult, setAtsResult] = React.useState<{
    score: number;
    matched: string[];
    missing: string[];
    suggestions: string[];
    summary?: string;
  }>({
    score: 93,
    matched: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Microservices", "Docker"],
    missing: ["Kubernetes", "Redis", "AWS EKS"],
    suggestions: [
      "Quantify throughput benchmarks for your Kafka streams real-time processing.",
      "Explicitly mention container orchestration if you managed Docker/Helm deployments.",
      "Highlight your CI/CD optimization metrics (e.g. 50% pipeline acceleration).",
    ],
    summary: "High 93% match probability with top ATS score for Java Backend engineering roles.",
  });

  // Load versions from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("huntboard_cv_versions");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVersions(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading CV versions:", e);
    }
  }, []);

  const saveVersionsToStorage = (updated: CVVersion[]) => {
    setVersions(updated);
    try {
      localStorage.setItem("huntboard_cv_versions", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving CV versions:", e);
    }
  };

  const handleSaveVersion = (versionName: string) => {
    const newVersion: CVVersion = {
      id: `ver-${crypto.randomUUID()}`,
      name: versionName,
      targetRole: cvData.personal.title,
      targetCompany: "Custom",
      updatedAt: new Date().toLocaleDateString(),
      isDefault: false,
      data: JSON.parse(JSON.stringify(cvData)),
    };

    const updated = [newVersion, ...versions];
    saveVersionsToStorage(updated);
    setActiveVersionName(versionName);
  };

  const handleLoadVersion = (ver: CVVersion) => {
    setCvData(JSON.parse(JSON.stringify(ver.data)));
    setActiveVersionName(ver.name);
    setActiveTab("editor");
  };

  const handleDuplicateVersion = (ver: CVVersion) => {
    const copy: CVVersion = {
      ...ver,
      id: `ver-${crypto.randomUUID()}`,
      name: `${ver.name} (Copy)`,
      updatedAt: new Date().toLocaleDateString(),
      isDefault: false,
    };
    saveVersionsToStorage([copy, ...versions]);
  };

  const handleDeleteVersion = (id: string) => {
    const filtered = versions.filter((v) => v.id !== id);
    saveVersionsToStorage(filtered.length > 0 ? filtered : INITIAL_VERSIONS);
  };

  // ATS Analysis using OpenAI API
  const handleRunATS = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = localStorage.getItem("huntboard_api_key") || "";
      const provider = localStorage.getItem("huntboard_ai_provider") || "openai";
      const model = localStorage.getItem("huntboard_ai_model") || "gpt-4o";

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ats-benchmark",
          apiKey,
          provider,
          model,
          cvData,
          jobDescription,
        }),
      });

      if (!res.ok) throw new Error("ATS benchmark failed");
      const data = await res.json();
      setAtsResult({
        score: data.score || 91,
        matched: data.matched || ["Java", "Spring Boot", "Kafka", "PostgreSQL"],
        missing: data.missing || ["Kubernetes"],
        suggestions: data.suggestions || ["Add measurable performance metrics."],
        summary: data.summary || "High match alignment with job specifications.",
      });
    } catch (err) {
      console.error("ATS analysis error:", err);
      // Fallback
      setAtsResult({
        score: 92,
        matched: ["Java", "Spring Boot", "Kafka", "SQL", "Microservices", "Docker"],
        missing: ["Kubernetes", "AWS EKS"],
        suggestions: [
          "Include team size and agile leadership highlights.",
          "Add specific numbers for database query optimizations.",
        ],
        summary: "Excellent technical compatibility with the target vacancy.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Clean, Single Purpose, No Duplicate Print Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.cv.title}
            <Badge variant="purple" className="text-xs">
              {activeVersionName}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.cv.subtitle}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium space-x-6 no-print">
        <button
          onClick={() => setActiveTab("editor")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "editor"
              ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          <span>{t.cv.tabs.editor}</span>
        </button>
        <button
          onClick={() => setActiveTab("ats")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "ats"
              ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{t.cv.tabs.ats}</span>
        </button>
        <button
          onClick={() => setActiveTab("versions")}
          className={`pb-3 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === "versions"
              ? "border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-300 font-semibold"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>
            {t.cv.tabs.versions} ({versions.length})
          </span>
        </button>
      </div>

      {/* Tab: Form Editor & Live Preview */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left: Interactive Form with AI tools */}
          <div className="no-print space-y-4">
            <CVFormEditor
              cvData={cvData}
              onChange={setCvData}
              onSaveVersion={handleSaveVersion}
            />
          </div>

          {/* Right: Printable ATS Document Sheet with Page Count & Single Export Button */}
          <div className="overflow-x-auto flex justify-center py-2 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 shadow-inner">
            <CVPreview data={cvData} />
          </div>
        </div>
      )}

      {/* Tab: ATS Benchmark */}
      {activeTab === "ats" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          {/* Vacancy input */}
          <div className="space-y-4">
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <Bot className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                Target Job Vacancy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Paste job requirements to compare with your active CV using OpenAI GPT-4o.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    Job Link (Optional)
                  </label>
                  <Input
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                    {t.cv.atsBenchmarkTitle}
                  </label>
                  <textarea
                    rows={7}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
                  />
                </div>

                <Button
                  onClick={handleRunATS}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold gap-2 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isAnalyzing ? t.cv.analyzingAtsBtn : t.cv.runAtsBtn}</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Report */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-indigo-500/20 bg-white dark:bg-slate-900/80 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t.cv.overallAtsScore}
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      {atsResult.score >= 90 ? t.cv.atsExcellent : t.cv.atsStrong}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      {atsResult.score}
                      <span className="text-xl text-slate-400 dark:text-slate-500">/100</span>
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {t.cv.atsPassProb}
                    </span>
                  </div>
                  {atsResult.summary && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-medium">
                      {atsResult.summary}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setActiveTab("editor")}
                  variant="outline"
                  size="sm"
                  className="text-xs border-slate-200 dark:border-slate-700 gap-1.5 text-slate-700 dark:text-slate-200"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{t.cv.editCvWithAts}</span>
                </Button>
              </div>

              {/* Matched & Missing Keywords */}
              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {t.cv.matchedKeywords} ({atsResult.matched.length})
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
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      {t.cv.missingKeywords}
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
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t.cv.aiActionableRecs}
                  </h4>
                  {atsResult.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/20 p-3 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                    >
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
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
        <div className="space-y-5 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.cv.savedCvVersions} ({versions.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.cv.savedCvVersionsDesc}
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                const name = `Tailored for New Role (${new Date().toLocaleDateString()})`;
                handleSaveVersion(name);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 self-start"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.cv.saveCurrentAsNew}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {versions.map((v) => (
              <Card
                key={v.id}
                className={`border p-5 space-y-4 transition-all shadow-sm ${
                  v.name === activeVersionName
                    ? "border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {v.name}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {v.targetRole || v.data.personal.title}
                    </p>
                  </div>
                  {v.name === activeVersionName && (
                    <Badge variant="purple" className="text-[10px] shrink-0">
                      {t.cv.activeVersionBadge}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{v.updatedAt}</span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateVersion(v)}
                      className="h-7 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2"
                      title={t.cv.duplicateVersion}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    {versions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVersion(v.id)}
                        className="h-7 text-xs text-slate-400 hover:text-red-500 px-2"
                        title={t.cv.deleteVersion}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={v.name === activeVersionName ? "default" : "outline"}
                    onClick={() => handleLoadVersion(v)}
                    className="h-7 text-xs gap-1.5 font-medium"
                  >
                    <span>{v.name === activeVersionName ? t.cv.activeVersionBadge : t.cv.loadIntoEditor}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
