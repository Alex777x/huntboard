"use client";

import * as React from "react";
import {
  User,
  MapPin,
  Briefcase,
  Globe,
  Linkedin,
  Github,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Save,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/I18nProvider";

interface SkillItem {
  name: string;
  level: "Junior" | "Mid" | "Senior" | "Lead / Expert";
}

export default function ProfilePage() {
  const { t } = useI18n();
  const [fullName, setFullName] = React.useState("Anatoli Liaksandrou");
  const [currentRole, setCurrentRole] = React.useState("Java Software Engineer");
  const [desiredRole, setDesiredRole] = React.useState("Senior Java / Microservices Engineer");
  const [location, setLocation] = React.useState("Poland, Bialystok");
  const [openToRelocation, setOpenToRelocation] = React.useState(true);
  const [visibleToRecruiters, setVisibleToRecruiters] = React.useState(false);
  const [linkedinUrl, setLinkedinUrl] = React.useState("https://www.linkedin.com/in/anatoli-aliaksandrou/");
  const [githubUrl, setGithubUrl] = React.useState("https://github.com/alexandroff103");
  const [portfolioUrl, setPortfolioUrl] = React.useState("");

  const [skills, setSkills] = React.useState<SkillItem[]>([
    { name: "Java & Spring Boot", level: "Lead / Expert" },
    { name: "Apache Kafka & Streams", level: "Lead / Expert" },
    { name: "Microservices Architecture", level: "Senior" },
    { name: "PostgreSQL & SQL Optimization", level: "Senior" },
    { name: "Docker & CI/CD", level: "Senior" },
    { name: "JUnit & TestContainers", level: "Senior" },
  ]);

  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillLevel, setNewSkillLevel] = React.useState<SkillItem["level"]>("Senior");
  const [saved, setSaved] = React.useState(false);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([...skills, { name: newSkillName.trim(), level: newSkillLevel }]);
    setNewSkillName("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.profile.title}
            <Badge variant="purple" className="text-xs">
              {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.profile.subtitle}
          </p>
        </div>

        <Button
          onClick={handleSave}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{saved ? t.common.saveChanges : t.profile.saveProfile}</span>
        </Button>
      </div>

      {/* Recruiter Visibility Card (Opt-in) */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.profile.recruiterVisibilityTitle}
              </h3>
              <Badge variant={visibleToRecruiters ? "success" : "secondary"} className="text-[10px]">
                {visibleToRecruiters ? t.profile.visibleBadge : t.profile.hiddenBadge}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.profile.recruiterVisibilityDesc}
            </p>
          </div>

          <Button
            size="sm"
            variant={visibleToRecruiters ? "default" : "outline"}
            onClick={() => setVisibleToRecruiters(!visibleToRecruiters)}
            className={`text-xs gap-1.5 shrink-0 ${
              visibleToRecruiters
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            {visibleToRecruiters ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{visibleToRecruiters ? t.settings.visibleOn : t.settings.visibleOff}</span>
          </Button>
        </div>
      </Card>

      {/* Main Info Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-6 shadow-sm">
        {/* Avatar & Roles */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-200 dark:border-slate-800">
          <Avatar className="h-16 w-16 border-2 border-indigo-500/40">
            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-lg">
              AL
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{fullName}</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">{currentRole}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              {location} • {openToRelocation ? "Open to Relocation" : "No Relocation"}
            </p>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Current Role / Title *</label>
            <Input
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Desired Role</label>
            <Input
              value={desiredRole}
              onChange={(e) => setDesiredRole(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Location (City, Country)</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
            />
          </div>
        </div>

        {/* Relocation Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="relocation"
            checked={openToRelocation}
            onChange={(e) => setOpenToRelocation(e.target.checked)}
            className="rounded border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="relocation" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
            Open to international relocation / visa sponsorship
          </label>
        </div>

        {/* Social Accounts */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Public Profiles & Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Linkedin className="h-3.5 w-3.5 text-sky-500" />
                LinkedIn
              </label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Github className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                GitHub
              </label>
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-indigo-500" />
                Portfolio
              </label>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Skills Matrix Card */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              Skills & Expertise Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add key technologies with your proficiency level
            </p>
          </div>
        </div>

        {/* Add Skill Row */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Input
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="e.g. Docker, Redis, Next.js"
            className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs flex-1"
          />
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value as SkillItem["level"])}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Lead / Expert">Lead / Expert</option>
            <option value="Senior">Senior</option>
            <option value="Mid">Mid</option>
            <option value="Junior">Junior</option>
          </select>
          <Button
            onClick={handleAddSkill}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Button>
        </div>

        {/* Skills Tag Cloud */}
        <div className="flex flex-wrap gap-2 pt-3">
          {skills.map((skill, idx) => (
            <div
              key={skill.name}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
            >
              <span className="font-semibold text-slate-900 dark:text-white">{skill.name}</span>
              <span className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                {skill.level}
              </span>
              <button
                onClick={() => handleRemoveSkill(idx)}
                className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-0.5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
