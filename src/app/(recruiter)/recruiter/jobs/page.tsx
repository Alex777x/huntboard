"use client";

import * as React from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Users2,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JobDialog } from "@/components/recruiter/JobDialog";
import { RecruiterJob } from "@/types/database";
import { useI18n } from "@/components/providers/I18nProvider";
import { localeIncludes } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function RecruiterJobsPage() {
  const { t, locale, fmt } = useI18n();
  const [jobs, setJobs] = React.useState<RecruiterJob[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "paused" | "closed">("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<RecruiterJob | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }
      
      const { data, error } = await supabase
        .from("recruiter_jobs")
        .select("*")
        .eq("recruiter_id", user.id)
        .limit(50)
        .order("created_at", { ascending: false });
        
      if (data && !error) {
        setJobs(data as RecruiterJob[]);
      }
    }
    fetchData();
  }, []);

  const filteredJobs = React.useMemo(() => {
    return jobs.filter((j) => {
      const matchesSearch =
        localeIncludes(j.title, search, locale) ||
        localeIncludes(j.description, search, locale) ||
        localeIncludes(j.location, search, locale);
      const matchesStatus = statusFilter === "all" ? true : j.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const handleSave = async (data: Partial<RecruiterJob>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (editingJob) {
      setJobs((prev) =>
        prev.map((j) => (j.id === editingJob.id ? ({ ...j, ...data } as RecruiterJob) : j))
      );
      if (user) {
        await supabase
          .from("recruiter_jobs")
          .update(data)
          .eq("id", editingJob.id);
      }
    } else {
      const recruiterId = user?.id || "00000000-0000-0000-0000-000000000001";
      const newJobPayload = {
        recruiter_id: recruiterId,
        title: data.title || "Software Engineer",
        company_name: data.company_name || "Company",
        description: data.description || "",
        requirements: data.requirements || "",
        work_format: data.work_format || "remote",
        location: data.location || "Remote",
        salary_min: data.salary_min || 140000,
        salary_max: data.salary_max || 180000,
        salary_currency: data.salary_currency || "USD",
        status: data.status || "active",
        view_count: 0,
        published_to_community: data.published_to_community ?? true,
      };

      if (user) {
        const { data: inserted, error } = await supabase
          .from("recruiter_jobs")
          .insert(newJobPayload)
          .select()
          .single();

        if (!error && inserted) {
          setJobs([inserted as RecruiterJob, ...jobs]);
          return;
        }
      }

      const fallbackJob: RecruiterJob = {
        ...newJobPayload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        applicants_count: 0,
      };
      setJobs([fallbackJob, ...jobs]);
    }
  };

  const handleDelete = async (id: string) => {
    setJobs(jobs.filter((j) => j.id !== id));
    setIsDialogOpen(false);
    const supabase = createClient();
    await supabase.from("recruiter_jobs").delete().eq("id", id);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.recruiter.jobsTitle}
            <Badge variant="purple" className="text-xs">
              {jobs.length} {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.recruiter.jobsSubtitle}
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
          <span>{t.recruiter.postNewJob}</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t.recruiter.totalApplicants}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {jobs.reduce((acc, j) => acc + j.applicants_count, 0)}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            {t.recruiter.newThisWeek}
          </span>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t.recruiter.activeListings}
          </span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-300">
            {jobs.filter((j) => j.status === "active").length}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {t.recruiter.communityBoardLive}
          </span>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
            {t.recruiter.totalViews}
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {jobs.reduce((acc, j) => acc + j.view_count, 0)}
          </div>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
            {t.recruiter.highDiscovery}
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.recruiter.searchTalent}
            className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {(["all", "active", "paused", "closed"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? "bg-purple-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {st === "all" ? t.common.all : st}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-3">
        {filteredJobs.map((job) => (
          <Card
            key={job.id}
            className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-4 hover:border-purple-500/40 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{job.title}</h3>
                  <Badge
                    variant={job.status === "active" ? "success" : "secondary"}
                    className="text-[10px] capitalize"
                  >
                    {job.status === "active" ? t.common.active : job.status}
                  </Badge>
                  {job.published_to_community && (
                    <Badge variant="purple" className="text-[10px]">
                      {t.recruiter.communityBoardLive}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-purple-700 dark:text-purple-300">{job.company_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {job.location} ({job.work_format})
                  </span>
                  <span>•</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {fmt.formatSalaryCompact(job.salary_min, job.salary_max, job.salary_currency)}
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
                  className="h-8 text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t.recruiter.editVacancy}
                </Button>

                <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                  <Button
                    size="sm"
                    className="h-8 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-sm shadow-purple-600/20"
                  >
                    <Users2 className="h-3.5 w-3.5" />
                    <span>{t.recruiter.viewAtsFunnel} ({job.applicants_count})</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
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
