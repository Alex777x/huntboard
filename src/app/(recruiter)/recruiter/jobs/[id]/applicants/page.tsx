"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users2,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
  Building,
  Briefcase,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ApplicantStage =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "interview"
  | "offer"
  | "rejected";

interface JobApplicant {
  id: string;
  name: string;
  email: string;
  currentRole: string;
  matchScore: number;
  stage: ApplicantStage;
  appliedDate: string;
  coverLetterSnippet: string;
  recruiterNotes: string;
  skills: string[];
}

const pipelineStages: { id: ApplicantStage; title: string; color: string }[] = [
  { id: "new", title: "New Applicants", color: "border-blue-500/30" },
  { id: "reviewed", title: "Reviewed / Screening", color: "border-purple-500/30" },
  { id: "shortlisted", title: "Shortlisted ⭐", color: "border-amber-500/30" },
  { id: "interview", title: "Technical Interview", color: "border-indigo-500/30" },
  { id: "offer", title: "Offer Extended 🎉", color: "border-emerald-500/30" },
  { id: "rejected", title: "Archived / Rejected", color: "border-slate-800" },
];

const initialApplicants: JobApplicant[] = [
  {
    id: "app-1",
    name: "Anatoli Liaksandrou",
    email: "anatoli@example.com",
    currentRole: "Senior Fullstack Engineer",
    matchScore: 96,
    stage: "interview",
    appliedDate: "Aug 22, 2026",
    coverLetterSnippet:
      "Passionate Software Engineer with 6+ years in Next.js 15, TypeScript and distributed PostgreSQL systems...",
    recruiterNotes: "Exceptional system design background. Scheduled for panel with VP of Engineering.",
    skills: ["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS"],
  },
  {
    id: "app-2",
    name: "Marek Kowalski",
    email: "marek@example.com",
    currentRole: "Staff Frontend Engineer",
    matchScore: 92,
    stage: "shortlisted",
    appliedDate: "Aug 23, 2026",
    coverLetterSnippet: "Specialized in micro-frontends and core web vitals optimization.",
    recruiterNotes: "Strong UI craft. Reviewing code samples.",
    skills: ["React 19", "TypeScript", "Vite", "Design Systems"],
  },
  {
    id: "app-3",
    name: "Elena Rostova",
    email: "elena@example.com",
    currentRole: "Fullstack Developer",
    matchScore: 86,
    stage: "reviewed",
    appliedDate: "Aug 24, 2026",
    coverLetterSnippet: "3 years experience with Next.js and Supabase backend.",
    recruiterNotes: "Good candidate for Mid/Senior band.",
    skills: ["Next.js", "Node.js", "Supabase"],
  },
  {
    id: "app-4",
    name: "David Kim",
    email: "david@example.com",
    currentRole: "Frontend Engineer",
    matchScore: 78,
    stage: "new",
    appliedDate: "Aug 25, 2026",
    coverLetterSnippet: "Looking to transition into high-scale fintech systems.",
    recruiterNotes: "Awaiting initial resume screen.",
    skills: ["JavaScript", "React", "CSS"],
  },
  {
    id: "app-5",
    name: "Sophie Laurent",
    email: "sophie@example.com",
    currentRole: "Lead Architect",
    matchScore: 98,
    stage: "offer",
    appliedDate: "Aug 15, 2026",
    coverLetterSnippet: "Ex-Stripe technical lead with extensive payments domain experience.",
    recruiterNotes: "Offer extended: $185k base + equity grant. Awaiting sign-off.",
    skills: ["Next.js", "TypeScript", "Postgres", "Distributed Systems"],
  },
];

export default function JobApplicantsPage() {
  const params = useParams();
  const [applicants, setApplicants] = React.useState<JobApplicant[]>(initialApplicants);
  const [search, setSearch] = React.useState("");
  const [selectedApplicant, setSelectedApplicant] = React.useState<JobApplicant | null>(null);

  const moveStage = (applicantId: string, newStage: ApplicantStage) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, stage: newStage } : a))
    );
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant({ ...selectedApplicant, stage: newStage });
    }
  };

  const filteredApplicants = applicants.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.currentRole.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Job Listings</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Senior Fullstack Engineer (Payments)
            <Badge variant="purple" className="text-xs">
              ATS Pipeline
            </Badge>
          </h1>
          <p className="text-xs text-slate-400">
            {applicants.length} total applicants • Click any candidate card to inspect details and move across stages
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter candidates..."
            className="pl-8 text-xs bg-slate-900/60 border-slate-800"
          />
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
        {pipelineStages.map((stage) => {
          const stageApplicants = filteredApplicants.filter((a) => a.stage === stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 min-w-[270px] max-w-[290px] flex-1 backdrop-blur-sm"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                <span className="text-xs font-semibold text-slate-200">
                  {stage.title}
                </span>
                <span className="rounded-full bg-slate-800/80 px-2 py-0.2 text-[10px] font-bold text-slate-400">
                  {stageApplicants.length}
                </span>
              </div>

              {/* Cards */}
              <div className="mt-3 flex-1 space-y-2.5 min-h-[120px]">
                {stageApplicants.map((app) => (
                  <Card
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className="cursor-pointer border-slate-800/90 bg-slate-900/90 p-3.5 space-y-2.5 hover:border-purple-500/50 hover:bg-slate-900 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-slate-700">
                          <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-[10px]">
                            {app.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {app.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                            {app.currentRole}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400 shrink-0">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>{app.matchScore}%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {app.skills.slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-950 border border-slate-800/80 px-1.5 py-0.2 text-[9px] text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-500">
                      <span>Applied {app.appliedDate}</span>
                      <span className="text-purple-400 font-medium hover:underline">
                        Review →
                      </span>
                    </div>
                  </Card>
                ))}

                {stageApplicants.length === 0 && (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-slate-800/60 text-[11px] text-slate-600">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Inspector Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-purple-500/30">
                  <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-sm">
                    {selectedApplicant.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedApplicant.name}
                    <Badge variant="success" className="text-[10px]">
                      {selectedApplicant.matchScore}% Match
                    </Badge>
                  </h3>
                  <p className="text-xs text-purple-300">{selectedApplicant.currentRole}</p>
                  <p className="text-[11px] text-slate-400">{selectedApplicant.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Move Stage Bar */}
            <div className="space-y-1.5 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Update Pipeline Stage
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {pipelineStages.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => moveStage(selectedApplicant.id, s.id)}
                    className={`rounded-lg py-1.5 px-2 text-[10px] font-bold capitalize transition-all ${
                      selectedApplicant.stage === s.id
                        ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                    }`}
                  >
                    {s.title.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Letter / Pitch */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                Applicant Cover Letter / Summary
              </label>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 leading-relaxed font-sans">
                {selectedApplicant.coverLetterSnippet}
              </div>
            </div>

            {/* Recruiter Private Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
                Internal Recruiter Notes & Panel Feedback
              </label>
              <textarea
                rows={3}
                value={selectedApplicant.recruiterNotes}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedApplicant({ ...selectedApplicant, recruiterNotes: val });
                  setApplicants((prev) =>
                    prev.map((a) =>
                      a.id === selectedApplicant.id ? { ...a, recruiterNotes: val } : a
                    )
                  );
                }}
                placeholder="Write private notes on coding test, culture fit, compensation requirements..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedApplicant(null)}
                className="text-xs text-slate-400"
              >
                Close
              </Button>
              <Button
                onClick={() => setSelectedApplicant(null)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
              >
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
