"use client";

import * as React from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Languages,
  Save,
  Check,
  Shield,
  FileCheck,
  Wand2,
  Loader2,
  BookmarkPlus,
  ArrowRight,
  RefreshCw,
  X,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CVData, ExperienceItem, EducationItem, LanguageItem } from "@/types/cv";
import { useI18n } from "@/components/providers/I18nProvider";

const LANGUAGE_PROFICIENCY_OPTIONS = [
  "Native",
  "Fluent / Bilingual (C2)",
  "Advanced (C1)",
  "Upper-Intermediate (B2)",
  "Intermediate (B1)",
  "Elementary (A2)",
  "Beginner (A1)",
  "Custom...",
];

const GDPR_TEMPLATES = [
  {
    label: "🇪🇺 EU Standard (English)",
    text: "I hereby consent to my personal data being processed for the purpose of current and future recruitment processes.",
  },
  {
    label: "🇵🇱 Poland RODO (Polish)",
    text: "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji (zgodnie z ustawą z dnia 10 maja 2018 roku o ochronie danych osobowych (Dz. Ustaw z 2018, poz. 1000) oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO)).",
  },
  {
    label: "🇵🇱 Poland RODO (English)",
    text: "I hereby consent to the processing of my personal data for the needs of the recruitment process in accordance with Regulation (EU) 2016/679 of the European Parliament and of the Council (GDPR).",
  },
];

interface CVFormEditorProps {
  cvData: CVData;
  onChange: (data: CVData) => void;
  onSaveVersion?: (versionName: string) => void;
}

export function CVFormEditor({ cvData, onChange, onSaveVersion }: CVFormEditorProps) {
  const { t, locale, fmt } = useI18n();
  const [activeTab, setActiveTab] = React.useState<
    "personal" | "experience" | "skills" | "languages" | "education" | "gdpr"
  >("personal");
  const [skillInput, setSkillInput] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  // Save Version Dialog
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [versionNameInput, setVersionNameInput] = React.useState("");

  // AI Summary Modal
  const [isSummaryModalOpen, setIsSummaryModalOpen] = React.useState(false);
  const [isOptimizingSummary, setIsOptimizingSummary] = React.useState(false);
  const [summaryTone, setSummaryTone] = React.useState<"professional" | "leadership" | "technical">("professional");
  const [generatedSummary, setGeneratedSummary] = React.useState("");

  // AI Bullets Modal
  const [bulletsModalTarget, setBulletsModalTarget] = React.useState<{ expId: string; pIdx: number } | null>(null);
  const [isEnhancingBullets, setIsEnhancingBullets] = React.useState(false);
  const [originalBulletsText, setOriginalBulletsText] = React.useState("");
  const [generatedBulletsText, setGeneratedBulletsText] = React.useState("");

  // AI Skills Extractor Modal
  const [isSkillsModalOpen, setIsSkillsModalOpen] = React.useState(false);
  const [isExtractingSkills, setIsExtractingSkills] = React.useState(false);
  const [extractedSkillsList, setExtractedSkillsList] = React.useState<string[]>([]);
  const [selectedSkillsToAdd, setSelectedSkillsToAdd] = React.useState<string[]>([]);

  const getSavedAISettings = () => {
    if (typeof window === "undefined") return { apiKey: "", provider: "openai", model: "gpt-4o" };
    return {
      apiKey: localStorage.getItem("huntboard_api_key") || "",
      provider: localStorage.getItem("huntboard_ai_provider") || "openai",
      model: localStorage.getItem("huntboard_ai_model") || "gpt-4o",
    };
  };

  const handleOpenSaveModal = () => {
    const defaultName = `Tailored for ${cvData.personal.title || "Role"} (${fmt.formatDate(new Date())})`;
    setVersionNameInput(defaultName);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSaveVersion = () => {
    const finalName = versionNameInput.trim() || `CV Version (${fmt.formatDate(new Date())})`;
    onSaveVersion?.(finalName);
    setIsSaveModalOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // AI: Open Summary Modal & Generate
  const handleOpenSummaryAI = async (tone = summaryTone) => {
    setIsSummaryModalOpen(true);
    setIsOptimizingSummary(true);
    try {
      const { apiKey, provider, model } = getSavedAISettings();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "optimize-summary",
          apiKey,
          provider,
          model,
          cvData,
          targetRole: cvData.personal.title,
          tone,
        }),
      });

      if (!res.ok) throw new Error("AI summary generation failed");
      const data = await res.json();
      setGeneratedSummary(data.summary || "");
    } catch (err) {
      console.error("AI Summary error:", err);
    } finally {
      setIsOptimizingSummary(false);
    }
  };

  const handleApplySummary = () => {
    if (generatedSummary) {
      handlePersonalChange("summary", generatedSummary);
    }
    setIsSummaryModalOpen(false);
  };

  // AI: Open Bullets Modal & Enhance
  const handleOpenBulletsAI = async (expId: string, pIdx: number) => {
    const exp = cvData.experience.find((e) => e.id === expId);
    if (!exp || !exp.projects?.[pIdx]) return;

    const raw = exp.projects[pIdx].highlights?.join("\n") || "";
    setOriginalBulletsText(raw);
    setBulletsModalTarget({ expId, pIdx });
    setIsEnhancingBullets(true);

    try {
      const { apiKey, provider, model } = getSavedAISettings();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enhance-bullets",
          apiKey,
          provider,
          model,
          textToEnhance: raw,
          jobTitle: exp.role,
        }),
      });

      if (!res.ok) throw new Error("AI bullet enhancement failed");
      const data = await res.json();
      setGeneratedBulletsText(data.enhanced || "");
    } catch (err) {
      console.error("AI Bullets error:", err);
    } finally {
      setIsEnhancingBullets(false);
    }
  };

  const handleApplyBullets = () => {
    if (bulletsModalTarget && generatedBulletsText) {
      handleUpdateProjectHighlights(
        bulletsModalTarget.expId,
        bulletsModalTarget.pIdx,
        generatedBulletsText
      );
    }
    setBulletsModalTarget(null);
  };

  // AI: Open Skills Extractor
  const handleOpenSkillsAI = async () => {
    setIsSkillsModalOpen(true);
    setIsExtractingSkills(true);
    try {
      const { apiKey, provider, model } = getSavedAISettings();
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract-skills",
          apiKey,
          provider,
          model,
          cvData,
        }),
      });

      if (!res.ok) throw new Error("Skill extraction failed");
      const data = await res.json();
      const skills = (data.skills as string[]) || [];
      const newSkills = skills.filter((s) => !cvData.skills.includes(s));
      setExtractedSkillsList(newSkills);
      setSelectedSkillsToAdd(newSkills);
    } catch (err) {
      console.error("AI extract skills error:", err);
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const handleApplyExtractedSkills = () => {
    if (selectedSkillsToAdd.length > 0) {
      const updated = Array.from(new Set([...cvData.skills, ...selectedSkillsToAdd]));
      onChange({ ...cvData, skills: updated });
    }
    setIsSkillsModalOpen(false);
  };

  // Personal info update
  const handlePersonalChange = (field: keyof CVData["personal"], value: string) => {
    onChange({
      ...cvData,
      personal: {
        ...cvData.personal,
        [field]: value,
      },
    });
  };

  // Skills
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!skillInput.trim()) return;

    const newItems = skillInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !cvData.skills.includes(s));

    if (newItems.length > 0) {
      onChange({
        ...cvData,
        skills: [...cvData.skills, ...newItems],
      });
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    onChange({
      ...cvData,
      skills: cvData.skills.filter((s) => s !== skill),
    });
  };

  // Experience
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${crypto.randomUUID()}`,
      company: "Company Name",
      companyDescription: "Description of the company and business domain.",
      role: "Software Engineer",
      location: "Location",
      startDate: "May 2025",
      endDate: "Present",
      current: true,
      description: "",
      projects: [
        {
          name: "Project Name: Brief project description.",
          highlights: [
            "Development of key features and business logic.",
            "Optimized system performance and improved unit test coverage.",
          ],
        },
      ],
      technologies: ["Java", "Spring Boot"],
    };
    onChange({
      ...cvData,
      experience: [newExp, ...cvData.experience],
    });
  };

  const handleUpdateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange({
      ...cvData,
      experience: cvData.experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...cvData,
      experience: cvData.experience.filter((exp) => exp.id !== id),
    });
  };

  const handleAddProjectToExperience = (expId: string) => {
    const exp = cvData.experience.find((e) => e.id === expId);
    if (!exp) return;

    const updatedProjects = [
      ...(exp.projects || []),
      {
        name: "New Project: Description",
        highlights: ["Implemented key functionality.", "Collaborated across teams."],
      },
    ];

    handleUpdateExperience(expId, { projects: updatedProjects });
  };

  const handleUpdateProjectName = (expId: string, pIdx: number, newName: string) => {
    const exp = cvData.experience.find((e) => e.id === expId);
    if (!exp || !exp.projects) return;

    const updatedProjects = [...exp.projects];
    updatedProjects[pIdx] = { ...updatedProjects[pIdx], name: newName };
    handleUpdateExperience(expId, { projects: updatedProjects });
  };

  const handleUpdateProjectHighlights = (
    expId: string,
    pIdx: number,
    text: string
  ) => {
    const exp = cvData.experience.find((e) => e.id === expId);
    if (!exp || !exp.projects) return;

    // Preserve newlines so user can press Enter and format freely
    const highlights = text.split("\n");

    const updatedProjects = [...exp.projects];
    updatedProjects[pIdx] = { ...updatedProjects[pIdx], highlights };
    handleUpdateExperience(expId, { projects: updatedProjects });
  };

  const handleDeleteProjectFromExperience = (expId: string, pIdx: number) => {
    const exp = cvData.experience.find((e) => e.id === expId);
    if (!exp || !exp.projects) return;

    const updatedProjects = exp.projects.filter((_, i) => i !== pIdx);
    handleUpdateExperience(expId, { projects: updatedProjects });
  };

  // Education
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${crypto.randomUUID()}`,
      institution: "University / Academy Name",
      degree: "Bachelor's degree in Computer Science",
      startDate: "2019",
      endDate: "2023",
    };
    onChange({
      ...cvData,
      education: [...cvData.education, newEdu],
    });
  };

  const handleUpdateEducation = (id: string, updates: Partial<EducationItem>) => {
    onChange({
      ...cvData,
      education: cvData.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    });
  };

  // Languages
  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      language: "English",
      proficiency: "Upper-Intermediate (B2)",
    };
    onChange({
      ...cvData,
      languages: [...cvData.languages, newLang],
    });
  };

  const handleUpdateLanguage = (idx: number, updates: Partial<LanguageItem>) => {
    const updated = [...cvData.languages];
    updated[idx] = { ...updated[idx], ...updates };
    onChange({ ...cvData, languages: updated });
  };

  const handleDeleteLanguage = (idx: number) => {
    onChange({
      ...cvData,
      languages: cvData.languages.filter((_, i) => i !== idx),
    });
  };

  // GDPR Consent
  const handleToggleGDPR = (enabled: boolean) => {
    onChange({
      ...cvData,
      gdprConsent: {
        enabled,
        text:
          cvData.gdprConsent?.text ||
          "I hereby consent to my personal data being processed for the purpose of current and future recruitment processes.",
      },
    });
  };

  const handleGDPRTextChange = (text: string) => {
    onChange({
      ...cvData,
      gdprConsent: {
        enabled: cvData.gdprConsent?.enabled ?? true,
        text,
      },
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-5 shadow-sm relative">
      {/* 1. Save Version Modal */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookmarkPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.cv.saveVersionModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.cv.saveVersionModalDesc}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.cv.versionNameLabel}
              </label>
              <Input
                value={versionNameInput}
                onChange={(e) => setVersionNameInput(e.target.value)}
                placeholder={t.cv.versionNamePlaceholder}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-medium"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaveModalOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSaveVersion}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t.cv.saveVersionBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI Summary Before / After Modal */}
      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.cv.summaryModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tone selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">{t.cv.summaryToneLabel}</span>
              {[
                { id: "professional", label: t.cv.toneProfessional },
                { id: "leadership", label: t.cv.toneLeadership },
                { id: "technical", label: t.cv.toneTechnical },
              ].map((tOpt) => (
                <button
                  key={tOpt.id}
                  onClick={() => {
                    setSummaryTone(tOpt.id as any);
                    handleOpenSummaryAI(tOpt.id as any);
                  }}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-all ${
                    summaryTone === tOpt.id
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {tOpt.label}
                </button>
              ))}
            </div>

            {/* Before / After Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.cv.originalSummary}
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed min-h-[140px] max-h-[220px] overflow-y-auto">
                  {cvData.personal.summary || <span className="italic text-slate-400">Empty summary</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {t.cv.aiSuggestedSummary}
                  </span>
                  <button
                    onClick={() => handleOpenSummaryAI(summaryTone)}
                    disabled={isOptimizingSummary}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <RefreshCw className={`h-3 w-3 ${isOptimizingSummary ? "animate-spin" : ""}`} /> {t.cv.regenerateBtn}
                  </button>
                </div>
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 text-xs text-slate-900 dark:text-slate-100 leading-relaxed min-h-[140px] max-h-[220px] overflow-y-auto font-medium">
                  {isOptimizingSummary ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-2 py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      <span>{t.cv.optimizingBtn}</span>
                    </div>
                  ) : (
                    generatedSummary
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                disabled={isOptimizingSummary || !generatedSummary}
                onClick={handleApplySummary}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{t.cv.applySummaryBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Bullets Before / After Modal */}
      {bulletsModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.cv.bulletsModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setBulletsModalTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.cv.bulletsModalDesc}
            </p>

            {/* Before / After Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.cv.originalBullets}
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3.5 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed min-h-[160px] max-h-[260px] overflow-y-auto whitespace-pre-wrap">
                  {originalBulletsText || <span className="italic text-slate-400 font-sans">No bullets typed</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {t.cv.aiEnhancedBullets}
                  </span>
                </div>
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 text-xs font-mono text-slate-900 dark:text-slate-100 leading-relaxed min-h-[160px] max-h-[260px] overflow-y-auto whitespace-pre-wrap font-medium">
                  {isEnhancingBullets ? (
                    <div className="flex items-center justify-center h-full text-slate-400 gap-2 py-10 font-sans">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      <span>{t.cv.enhancingBtn}</span>
                    </div>
                  ) : (
                    generatedBulletsText
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulletsModalTarget(null)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                disabled={isEnhancingBullets || !generatedBulletsText}
                onClick={handleApplyBullets}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
                <span>{t.cv.applyBulletsBtn}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. AI Skills Extractor Modal */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.cv.skillsModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsSkillsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.cv.skillsModalDesc}
            </p>

            {isExtractingSkills ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                <span>{t.cv.extractingSkillsBtn}</span>
              </div>
            ) : extractedSkillsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                {t.cv.noNewSkills}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto p-1">
                {extractedSkillsList.map((skill) => {
                  const isSelected = selectedSkillsToAdd.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSkillsToAdd(selectedSkillsToAdd.filter((s) => s !== skill));
                        } else {
                          setSelectedSkillsToAdd([...selectedSkillsToAdd, skill]);
                        }
                      }}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <span>{isSelected ? "✓" : "+"}</span>
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSkillsModalOpen(false)}
                className="text-xs"
              >
                {t.common.cancel}
              </Button>
              <Button
                size="sm"
                disabled={isExtractingSkills || selectedSkillsToAdd.length === 0}
                onClick={handleApplyExtractedSkills}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.cv.addSelectedSkillsBtn} ({selectedSkillsToAdd.length})</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "personal", label: t.cv.formTabs.personal, icon: User },
            { id: "experience", label: t.cv.formTabs.experience, icon: Briefcase },
            { id: "skills", label: t.cv.formTabs.skills, icon: Sparkles },
            { id: "languages", label: t.cv.formTabs.languages, icon: Languages },
            { id: "education", label: t.cv.formTabs.education, icon: GraduationCap },
            { id: "gdpr", label: t.cv.formTabs.gdpr, icon: Shield },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        <Button
          onClick={handleOpenSaveModal}
          size="sm"
          className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
        >
          {saved ? <Check className="h-3.5 w-3.5" /> : <BookmarkPlus className="h-3.5 w-3.5" />}
          <span>{saved ? t.cv.savedBtn : t.cv.saveBtn}</span>
        </Button>
      </div>

      {/* Tab: Personal & Summary */}
      {activeTab === "personal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.fullName}
              </label>
              <Input
                value={cvData.personal.fullName}
                onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.title}
              </label>
              <Input
                value={cvData.personal.title}
                onChange={(e) => handlePersonalChange("title", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.email}
              </label>
              <Input
                type="email"
                value={cvData.personal.email}
                onChange={(e) => handlePersonalChange("email", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.phone}
              </label>
              <Input
                value={cvData.personal.phone || ""}
                onChange={(e) => handlePersonalChange("phone", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.location}
              </label>
              <Input
                value={cvData.personal.location || ""}
                onChange={(e) => handlePersonalChange("location", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.linkedin}
              </label>
              <Input
                value={cvData.personal.linkedinUrl || ""}
                onChange={(e) => handlePersonalChange("linkedinUrl", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.github}
              </label>
              <Input
                value={cvData.personal.githubUrl || ""}
                onChange={(e) => handlePersonalChange("githubUrl", e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>

          {/* Professional Summary with AI Modal & Large Comfortable Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.cv.personal.summary}
              </label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleOpenSummaryAI()}
                className="h-7 text-[11px] gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <Wand2 className="h-3 w-3" />
                <span>✨ Optimize Summary with AI</span>
              </Button>
            </div>
            <textarea
              rows={6}
              value={cvData.personal.summary || ""}
              onChange={(e) => handlePersonalChange("summary", e.target.value)}
              className="w-full min-h-[150px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed font-sans"
              placeholder={t.cv.personal.summaryPlaceholder}
            />
          </div>
        </div>
      )}

      {/* Tab: Experience */}
      {activeTab === "experience" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.cv.experience.subtitle}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleAddExperience}
              className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.cv.experience.addExperience}</span>
            </Button>
          </div>

          {cvData.experience.map((exp) => (
            <div
              key={exp.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3 relative"
            >
              <button
                type="button"
                onClick={() => handleDeleteExperience(exp.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 transition-colors"
                title="Delete company"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.experience.role}
                  </label>
                  <Input
                    value={exp.role}
                    onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.experience.dates}
                  </label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="Start Date"
                      value={exp.startDate}
                      onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8"
                    />
                    <Input
                      placeholder="End Date / Present"
                      value={exp.current ? "Present" : exp.endDate || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateExperience(exp.id, {
                          endDate: val,
                          current: val.toLowerCase() === "present",
                        });
                      }}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.experience.company}
                  </label>
                  <Input
                    value={exp.company}
                    onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.experience.location}
                  </label>
                  <Input
                    value={exp.location || ""}
                    onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {t.cv.experience.companyDescription}
                </label>
                <Input
                  value={exp.companyDescription || ""}
                  placeholder={t.cv.experience.companyDescPlaceholder}
                  onChange={(e) => handleUpdateExperience(exp.id, { companyDescription: e.target.value })}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                />
              </div>

              {/* Projects List under this company */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    {t.cv.experience.projectsTitle}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddProjectToExperience(exp.id)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Plus className="h-3 w-3" /> {t.cv.experience.addProject}
                  </button>
                </div>

                {exp.projects?.map((proj, pIdx) => (
                  <div key={pIdx} className="rounded-lg bg-white dark:bg-slate-900/90 p-3.5 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={proj.name}
                        placeholder={t.cv.experience.projectNamePlaceholder}
                        onChange={(e) => handleUpdateProjectName(exp.id, pIdx, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-7 font-medium flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteProjectFromExperience(exp.id, pIdx)}
                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 shrink-0 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Bullet points with large comfortable height and AI XYZ Formula Enhancer */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {t.cv.experience.bulletsLabel}
                        </label>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenBulletsAI(exp.id, pIdx)}
                          className="h-6 text-[10px] gap-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2 font-medium"
                        >
                          <Wand2 className="h-2.5 w-2.5" />
                          <span>✨ Enhance with XYZ Formula (AI)</span>
                        </Button>
                      </div>
                      <textarea
                        rows={6}
                        value={proj.highlights?.join("\n") || ""}
                        onChange={(e) => handleUpdateProjectHighlights(exp.id, pIdx, e.target.value)}
                        placeholder={t.cv.experience.bulletsPlaceholder}
                        className="w-full min-h-[150px] rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Skills */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.cv.skills.addLabel}
            </label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenSkillsAI}
              className="h-7 text-[11px] gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            >
              <Wand2 className="h-3 w-3" />
              <span>✨ Auto-Extract Skills with AI</span>
            </Button>
          </div>

          <div className="space-y-1.5">
            <div className="flex gap-2">
              <Input
                placeholder={t.cv.skills.addPlaceholder}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSkill}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs shrink-0"
              >
                {t.cv.skills.addBtn}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.cv.skills.hint}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              {t.cv.skills.cloudTitle} ({cvData.skills.length}):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {cvData.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="gap-1.5 text-xs py-1 px-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Languages */}
      {activeTab === "languages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.cv.languages.subtitle}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleAddLanguage}
              className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.cv.languages.addLanguage}</span>
            </Button>
          </div>

          <div className="space-y-3">
            {cvData.languages.map((lang, idx) => {
              const isPreset = LANGUAGE_PROFICIENCY_OPTIONS.includes(lang.proficiency);

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 shadow-xs"
                >
                  <Input
                    value={lang.language}
                    placeholder={t.cv.languages.languagePlaceholder}
                    onChange={(e) => handleUpdateLanguage(idx, { language: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:w-1/3 h-8"
                  />

                  {/* Standardized Dropdown */}
                  <select
                    value={isPreset ? lang.proficiency : "Custom..."}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Custom...") {
                        handleUpdateLanguage(idx, { proficiency: "" });
                      } else {
                        handleUpdateLanguage(idx, { proficiency: val });
                      }
                    }}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-8 flex-1"
                  >
                    {LANGUAGE_PROFICIENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {/* If custom is selected or proficiency not in preset */}
                  {!isPreset && (
                    <Input
                      value={lang.proficiency}
                      placeholder={t.cv.languages.proficiencyPlaceholder}
                      onChange={(e) => handleUpdateLanguage(idx, { proficiency: e.target.value })}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:w-1/3 h-8 font-medium"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteLanguage(idx)}
                    className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1.5 self-center transition-colors shrink-0"
                    title="Delete language"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Education */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.cv.education.subtitle}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleAddEducation}
              className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.cv.education.addEducation}</span>
            </Button>
          </div>

          {cvData.education.map((edu) => (
            <div
              key={edu.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3 relative"
            >
              <button
                type="button"
                onClick={() => handleDeleteEducation(edu.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 p-1 transition-colors"
                title="Delete education"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.education.institution}
                  </label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.cv.education.degree}
                  </label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs h-8 mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: GDPR / RODO Consent */}
      {activeTab === "gdpr" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.cv.gdpr.title}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.cv.gdpr.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="checkbox"
                id="gdprToggle"
                checked={cvData.gdprConsent?.enabled ?? true}
                onChange={(e) => handleToggleGDPR(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor="gdprToggle"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer select-none"
              >
                {t.cv.gdpr.toggle}
              </label>
            </div>
          </div>

          {(cvData.gdprConsent?.enabled ?? true) && (
            <div className="space-y-3">
              {/* Preset quick templates */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                  {t.cv.gdpr.templatesLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {GDPR_TEMPLATES.map((tmpl) => (
                    <Button
                      key={tmpl.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleGDPRTextChange(tmpl.text)}
                      className="text-[11px] h-7 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50"
                    >
                      {tmpl.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Textarea editor */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t.cv.gdpr.textLabel}
                </label>
                <textarea
                  rows={4}
                  value={
                    cvData.gdprConsent?.text ??
                    "I hereby consent to my personal data being processed for the purpose of current and future recruitment processes."
                  }
                  onChange={(e) => handleGDPRTextChange(e.target.value)}
                  placeholder="I hereby consent to my personal data being processed..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
