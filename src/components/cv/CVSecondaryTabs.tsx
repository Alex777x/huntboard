"use client";

import * as React from "react";
import { Plus, Trash2, Shield, FileCheck, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CVData, EducationItem, LanguageItem } from "@/types/cv";
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

interface CVSecondaryTabsProps {
  activeTab: "personal" | "experience" | "skills" | "languages" | "education" | "gdpr";
  cvData: CVData;
  onChange: (data: CVData) => void;
  onOpenSkillsAI: () => void;
}

export function CVSecondaryTabs({
  activeTab,
  cvData,
  onChange,
  onOpenSkillsAI,
}: CVSecondaryTabsProps) {
  const { t } = useI18n();
  const [skillInput, setSkillInput] = React.useState("");

  // Skills
  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
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
    <>
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
              onClick={onOpenSkillsAI}
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
    </>
  );
}
