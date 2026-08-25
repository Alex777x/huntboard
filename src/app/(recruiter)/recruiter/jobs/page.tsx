"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Users2,
  GitBranch,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JobDialog, RecruiterJob } from "@/components/recruiter/JobDialog";

const initialJobs: RecruiterJob[] = [
  {
    id: "job-1",
    recruiter_id: "rec-1",
    title: "Senior Fullstack Engineer (Payments)",
    company_name: "Stripe",
    description: "Core billing & payment infrastructure engineering team.",
    requirements: "• 5+ years with React, Next.js, Node.js\n• Experience with high-availability systems",
    work_format: "remote",
    location: "Remote (EU / US)",
    salary_min: 150000,
    salary_max: 185000,
    salary_currency: "USD",
    status: "active",
    view_count: 482,
    published_to_community: true,
    applicants_count: 14,
    created_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "job-2",
    recruiter_id: "rec-1",
    title: "Frontend Architect (Design Systems)",
    company_name: "Stripe",
    description: "Building scalable UI primitives and accessibility standards.",
    requirements: "• Deep TypeScript, Tailwind CSS, Radix UI mastery\n• Performance optimization",
    work_format: "remote",
    location: "Remote",
    salary_min: 160000,
    salary_max: 195000,
    salary_currency: "USD",
    status: "active",
    view_count: 319,
    published_to_community: true,
    applicants_count: 8,
    created_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "job-3",
    recruiter_id: "rec-1",
    title: "Staff Backend Engineer (Postgres & Data)",
    company_name: "Stripe",
    description: "Distributed ledger & transaction processing.",
    requirements: "• PostgreSQL query optimization, connection pooling\n• Distributed databases",
    work_format: "hybrid",
    location: "San Francisco, CA",
    salary_min: 190000,
    salary_max: 230000,
    salary_currency: "USD",
    status: "active",
    view_count: 245,
    published_to_community: false,
    applicants_count: 5,
    created_at: "2026-08-24T10:00:00Z",
  },
];

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = React.useState<RecruiterJob[]>(initialJobs);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "paused" | "closed">("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<RecruiterJob | null>(null);

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.description.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleSave = (data: Partial<RecruiterJob>) => {
    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? ({ ...j, ...data } as RecruiterJob) : j))
      );
    } else {
      const newJob: RecruiterJob = {
        id: `job-${Date.now()}`,
        recruiter_id: "rec-1",
        title: data.title || "Software Engineer",
        company_name: data.company_name || "Stripe",
        description: data.description || "",
        requirements: data.requirements || "",
        work_format: data.work_format || "remote",
        location: data.location || "Remote",
        salary_min: data.salary_min || 140000,
        salary_max: data.salary_max || 180000,
        salary_currency: "USD",
        status: data.status || "active",
        view_count: 0,
        published_to_community: data.published_to_community ?? true,
        applicants_count: 0,
        created_at: new Date().toISOString(),
      };
      setJobs([newJob, ...jobs]);
    }
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Job Vacancies
            <Badge variant="purple" className="text-xs">
              {jobs.length} Active Listings
            </Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Publish openings, review incoming applicant funnels, and invite talent directly
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingJob(null);
            setIsDialogOpen(true);
          }}
          size="sm"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-purple-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Vacancy</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">
            Total Applicants
          </span>
          <div className="text-2xl font-extrabold text-white">
            {jobs.reduce((acc, j) => acc + j.applicants_count, 0)}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            +6 new this week
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">
            Active Listings
          </span>
          <div className="text-2xl font-extrabold text-purple-300">
            {jobs.filter((j) => j.status === "active").length}
          </div>
          <span className="text-[10px] text-slate-400">
            Published to community board
          </span>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">
            Total Views
          </span>
          <div className="text-2xl font-extrabold text-white">
            {jobs.reduce((acc, j) => acc + j.view_count, 0)}
          </div>
          <span className="text-[10px] text-indigo-400 font-medium">
            High discovery rate
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title, location, or stack..."
            className="pl-8 text-xs bg-slate-900/60 border-slate-800"
          />
        </div>

        <div className="flex gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          {(["all", "active", "paused", "closed"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="border-slate-800/80 bg-slate-900/40 p-5 space-y-4 hover:border-purple-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{job.title}</h3>
                  <Badge
                    variant={job.status === "active" ? "success" : "secondary"}
                    className="text-[10px] capitalize"
                  >
                    {job.status}
                  </Badge>
                  {job.published_to_community && (
                    <Badge variant="purple" className="text-[10px]">
                      Community Board Live
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="font-semibold text-purple-300">{job.company_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {job.location} ({job.work_format})
                  </span>
                  <span>•</span>
                  <span className="text-slate-300 font-medium">
                    ${(job.salary_min! / 1000).toFixed(0)}k - ${(job.salary_max! / 1000).toFixed(0)}k {job.salary_currency}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setEditingJob(job);
                    setIsDialogOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs border-slate-800 text-slate-300 hover:bg-slate-800"
                >
                  Edit Vacancy
                </Button>

                <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                  <Button
                    size="sm"
                    className="h-8 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-purple-600/20"
                  >
                    <Users2 className="h-3.5 w-3.5" />
                    <span>View ATS Funnel ({job.applicants_count})</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              {job.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <JobDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        job={editingJob}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
