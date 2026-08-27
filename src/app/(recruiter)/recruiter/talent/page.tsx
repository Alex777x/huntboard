"use client";

import * as React from "react";
import {
  Users2,
  Search,
  MapPin,
  Sparkles,
  Send,
  ExternalLink,
  Shield,
  Briefcase,
  Globe,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { InviteCandidateDialog } from "@/components/recruiter/InviteCandidateDialog";
import { useI18n } from "@/components/providers/I18nProvider";

interface TalentProfile {
  id: string;
  name: string;
  currentRole: string;
  desiredRole: string;
  location: string;
  openToRelocation: boolean;
  visibleToRecruiters: boolean;
  skills: { name: string; level: string }[];
  matchScore: number;
  summary: string;
}

const talentDatabase: TalentProfile[] = [
  {
    id: "tal-1",
    name: "Anatoli Liaksandrou",
    currentRole: "Senior Fullstack Engineer",
    desiredRole: "Staff Web Architect / Principal Engineer",
    location: "Warsaw, Poland",
    openToRelocation: true,
    visibleToRecruiters: true, // Opt-in active
    skills: [
      { name: "Next.js 15", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "PostgreSQL & Supabase", level: "Senior" },
      { name: "Tailwind CSS v4", level: "Senior" },
      { name: "Distributed Systems", level: "Senior" },
    ],
    matchScore: 96,
    summary:
      "Fullstack engineer with 6+ years specializing in Next.js 15 App Router, distributed PostgreSQL systems, and AI tooling workflows.",
  },
  {
    id: "tal-2",
    name: "Marek Kowalski",
    currentRole: "Staff Frontend Engineer",
    desiredRole: "Frontend Tech Lead",
    location: "Krakow, Poland",
    openToRelocation: false,
    visibleToRecruiters: true,
    skills: [
      { name: "React 19", level: "Expert" },
      { name: "TypeScript", level: "Expert" },
      { name: "Design Systems", level: "Senior" },
      { name: "Web Performance", level: "Senior" },
    ],
    matchScore: 91,
    summary:
      "Specialist in web performance (CWV optimization, INP, LCP) and micro-frontend architectures.",
  },
  {
    id: "tal-3",
    name: "Svetlana Petrova",
    currentRole: "Senior Backend Developer",
    desiredRole: "Staff Backend Engineer",
    location: "Berlin, Germany",
    openToRelocation: true,
    visibleToRecruiters: true,
    skills: [
      { name: "PostgreSQL", level: "Expert" },
      { name: "Go / Golang", level: "Senior" },
      { name: "Distributed Systems", level: "Senior" },
      { name: "Kafka", level: "Mid" },
    ],
    matchScore: 89,
    summary:
      "Backend engineer building high-throughput payment transaction pipelines and database query optimization.",
  },
  {
    id: "tal-4",
    name: "Private Candidate (Hidden)",
    currentRole: "Lead Engineer",
    desiredRole: "VP of Engineering",
    location: "London, UK",
    openToRelocation: false,
    visibleToRecruiters: false, // HIDDEN: Candidate opted out
    skills: [{ name: "TypeScript", level: "Expert" }],
    matchScore: 80,
    summary: "Hidden candidate profile.",
  },
];

export default function TalentPoolPage() {
  const { t } = useI18n();
  const [search, setSearch] = React.useState("");
  const [relocationOnly, setRelocationOnly] = React.useState(false);
  const [selectedCandidate, setSelectedCandidate] = React.useState<TalentProfile | null>(null);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  // Filter ONLY candidates where visibleToRecruiters === true (strict privacy compliance)
  const visibleTalent = React.useMemo(() => {
    return talentDatabase
      .filter((cand) => cand.visibleToRecruiters)
      .filter((cand) => {
        const matchesSearch =
          cand.name.toLowerCase().includes(search.toLowerCase()) ||
          cand.currentRole.toLowerCase().includes(search.toLowerCase()) ||
          cand.desiredRole.toLowerCase().includes(search.toLowerCase()) ||
          cand.skills.some((s) => s.name.toLowerCase().includes(search.toLowerCase()));

        const matchesRelocation = relocationOnly ? cand.openToRelocation : true;

        return matchesSearch && matchesRelocation;
      });
  }, [search, relocationOnly]);

  const handleOpenInvite = (cand: TalentProfile) => {
    setSelectedCandidate(cand);
    setIsInviteOpen(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.recruiter.talentTitle}
            <Badge variant="purple" className="text-xs">
              {visibleTalent.length} {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.recruiter.talentSubtitle}
          </p>
        </div>

        {/* Privacy badge indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <Shield className="h-4 w-4 text-emerald-500" />
          <span>{t.recruiter.optInProtected}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.recruiter.searchTalent}
            className="pl-8 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRelocationOnly(!relocationOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              relocationOnly
                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{t.recruiter.openToRelocation}</span>
          </button>
        </div>
      </div>

      {/* Candidate List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleTalent.map((cand) => (
          <Card
            key={cand.id}
            className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-3">
              {/* Header: Name, Match & Invite CTA */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border border-purple-500/30">
                    <AvatarFallback className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                      {cand.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {cand.name}
                      <span className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-2.5 w-2.5" />
                        {cand.matchScore}% {t.recruiter.matchScore}
                      </span>
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">{cand.currentRole}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {cand.location} • {cand.openToRelocation ? t.recruiter.openToRelocation : t.recruiter.localOnly}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenInvite(cand)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-purple-600/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{t.recruiter.sendInvite.split(" ")[0]}</span>
                </Button>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/60">
                {cand.summary}
              </p>

              {/* Skills Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {t.recruiter.topSkills}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cand.skills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-[11px]"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400">({s.level})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Role Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate">
                {t.recruiter.seeking} <span className="text-slate-800 dark:text-slate-200 font-medium">{cand.desiredRole}</span>
              </span>
              <button
                onClick={() => handleOpenInvite(cand)}
                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold text-[11px] shrink-0"
              >
                {t.recruiter.sendInvite} →
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Dialog */}
      <InviteCandidateDialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        candidate={
          selectedCandidate
            ? {
                id: selectedCandidate.id,
                name: selectedCandidate.name,
                currentRole: selectedCandidate.currentRole,
                desiredRole: selectedCandidate.desiredRole,
                location: selectedCandidate.location,
                skills: selectedCandidate.skills.map((s) => s.name),
              }
            : null
        }
      />
    </div>
  );
}
