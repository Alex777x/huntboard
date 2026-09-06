"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  MoreHorizontal,
  Building2,
  Sparkles,
  Calendar,
  DollarSign,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { KanbanColumn } from "@/components/applications/KanbanColumn";
import { KanbanCard } from "@/components/applications/KanbanCard";
import { ApplicationDialog } from "@/components/applications/ApplicationDialog";
import { JobUrlImportDialog } from "@/components/applications/JobUrlImportDialog";
import { Application, ApplicationStatus } from "@/types/database";
import { useI18n } from "@/components/providers/I18nProvider";
import { localeIncludes } from "@/lib/utils";

const columnIds: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
];

const initialApplications: Application[] = [
  {
    id: "app-1",
    profile_id: "user-1",
    company_id: "Stripe",
    cv_id: null,
    recruiter_job_id: null,
    job_title: "Senior Fullstack Engineer",
    job_url: "https://stripe.com/jobs",
    job_description: "Core Payments platform engineering.",
    status: "interview",
    custom_status_id: null,
    source: "linkedin",
    work_format: "remote",
    job_location: "Remote (EU)",
    salary_min: 140000,
    salary_max: 170000,
    salary_currency: "USD",
    priority: 5,
    notes: "Passed coding interview. System design scheduled for tomorrow.",
    cover_letter: null,
    applied_at: "2026-08-20",
    next_interview_at: "2026-08-27T14:00:00Z",
    deadline_at: null,
    ats_score: {
      score: 92,
      matched_skills: ["Next.js", "TypeScript", "Postgres"],
      missing_skills: ["Ruby"],
      suggestions: ["Add high-throughput API metrics"],
    },
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
  },
  {
    id: "app-2",
    profile_id: "user-1",
    company_id: "Vercel",
    cv_id: null,
    recruiter_job_id: null,
    job_title: "Frontend Systems Engineer",
    job_url: "https://vercel.com/careers",
    job_description: "App Router & Turbopack Core team.",
    status: "phone_screen",
    custom_status_id: null,
    source: "referral",
    work_format: "remote",
    job_location: "Remote",
    salary_min: 150000,
    salary_max: 180000,
    salary_currency: "USD",
    priority: 5,
    notes: "Warm intro from David Chen. HR screen was very positive.",
    cover_letter: null,
    applied_at: "2026-08-22",
    next_interview_at: "2026-08-29T16:30:00Z",
    deadline_at: null,
    ats_score: {
      score: 88,
      matched_skills: ["React 19", "Next.js", "Tailwind"],
      missing_skills: ["Rust"],
      suggestions: ["Highlight Turbopack benchmark work"],
    },
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "app-3",
    profile_id: "user-1",
    company_id: "Spotify",
    cv_id: null,
    recruiter_job_id: null,
    job_title: "Staff Web Platform Engineer",
    job_url: "https://spotify.com/jobs",
    job_description: "Web SDK and creator tools.",
    status: "applied",
    custom_status_id: null,
    source: "linkedin",
    work_format: "hybrid",
    job_location: "Stockholm",
    salary_min: 110000,
    salary_max: 130000,
    salary_currency: "EUR",
    priority: 4,
    notes: "Applied with tailored Frontend CV.",
    cover_letter: null,
    applied_at: "2026-08-20",
    next_interview_at: null,
    deadline_at: null,
    ats_score: {
      score: 85,
      matched_skills: ["TypeScript", "Audio Web APIs"],
      missing_skills: ["Java"],
      suggestions: ["Tailor experience to platform SDKs"],
    },
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "app-4",
    profile_id: "user-1",
    company_id: "Linear",
    cv_id: null,
    recruiter_job_id: null,
    job_title: "Product Engineer",
    job_url: "https://linear.app/careers",
    job_description: "Fast keyboard-first issue tracker.",
    status: "offer",
    custom_status_id: null,
    source: "community",
    work_format: "remote",
    job_location: "Remote",
    salary_min: 160000,
    salary_max: 190000,
    salary_currency: "USD",
    priority: 5,
    notes: "Offer received! Negotiating equity and remote equipment budget.",
    cover_letter: null,
    applied_at: "2026-08-10",
    next_interview_at: null,
    deadline_at: "2026-09-05",
    ats_score: {
      score: 96,
      matched_skills: ["React", "TypeScript", "Sync Engines", "Tailwind"],
      missing_skills: [],
      suggestions: [],
    },
    created_at: "2026-08-10T10:00:00Z",
    updated_at: "2026-08-25T10:00:00Z",
  },
  {
    id: "app-5",
    profile_id: "user-1",
    company_id: "OpenAI",
    cv_id: null,
    recruiter_job_id: null,
    job_title: "Fullstack Platform Engineer",
    job_url: "https://openai.com/careers",
    job_description: "Developer platform & API playground.",
    status: "wishlist",
    custom_status_id: null,
    source: "company_site",
    work_format: "remote",
    job_location: "San Francisco / Remote",
    salary_min: 200000,
    salary_max: 250000,
    salary_currency: "USD",
    priority: 5,
    notes: "Preparing CV before submitting.",
    cover_letter: null,
    applied_at: null,
    next_interview_at: null,
    deadline_at: null,
    ats_score: {
      score: 91,
      matched_skills: ["Python", "TypeScript", "Next.js", "LLM"],
      missing_skills: [],
      suggestions: ["Run ATS Benchmark on CV"],
    },
    created_at: "2026-08-25T10:00:00Z",
    updated_at: "2026-08-25T10:00:00Z",
  },
];

export function ApplicationBoard() {
  const { t, locale, fmt } = useI18n();
  const [applications, setApplications] = React.useState<Application[]>(initialApplications);
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");
  const [search, setSearch] = React.useState("");
  const [activeDragApp, setActiveDragApp] = React.useState<Application | null>(null);

  const columns = React.useMemo(() => {
    return columnIds.map((id) => ({
      id,
      title: (t.applications.stages as Record<string, string>)[id] || id,
    }));
  }, [t]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [editingApp, setEditingApp] = React.useState<Application | null>(null);
  const [targetColumnStatus, setTargetColumnStatus] = React.useState<ApplicationStatus>("wishlist");

  // Sensors for DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required to trigger drag (prevents accidental click drag)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredApplications = React.useMemo(() => {
    if (!search.trim()) return applications;
    return applications.filter(
      (a) =>
        localeIncludes(a.job_title, search, locale) ||
        (a.company_id && localeIncludes(a.company_id, search, locale)) ||
        (a.notes && localeIncludes(a.notes, search, locale))
    );
  }, [applications, search, locale]);

  const groupedApplications = React.useMemo(() => {
    const groups = {} as Record<string, Application[]>;
    columnIds.forEach((id) => {
      groups[id] = [];
    });
    filteredApplications.forEach((app) => {
      if (groups[app.status]) {
        groups[app.status].push(app);
      }
    });
    return groups;
  }, [filteredApplications]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const found = applications.find((a) => a.id === active.id);
    if (found) setActiveDragApp(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragApp(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeApp = applications.find((a) => a.id === activeId);
    if (!activeApp) return;

    // Check if dropped directly on a column droppable
    const isColumn = columnIds.includes(overId as ApplicationStatus);

    if (isColumn) {
      const newStatus = overId as ApplicationStatus;
      if (activeApp.status !== newStatus) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === activeId
              ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
              : app
          )
        );
      }
      return;
    }

    // Dropped on another card
    const overApp = applications.find((a) => a.id === overId);
    if (overApp) {
      if (activeApp.status !== overApp.status) {
        // Move to new column
        setApplications((prev) =>
          prev.map((app) =>
            app.id === activeId
              ? { ...app, status: overApp.status, updated_at: new Date().toISOString() }
              : app
          )
        );
      } else {
        // Reorder within the same column
        setApplications((prev) => {
          const oldIndex = prev.findIndex((a) => a.id === activeId);
          const newIndex = prev.findIndex((a) => a.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    }
  };

  const handleCreateOrUpdate = (data: Partial<Application>) => {
    if (editingApp) {
      // Update
      setApplications((prev) =>
        prev.map((a) =>
          a.id === editingApp.id
            ? ({ ...a, ...data, updated_at: new Date().toISOString() } as Application)
            : a
        )
      );
    } else {
      // Create new
      const newApp: Application = {
        id: `app-${crypto.randomUUID()}`,
        profile_id: "user-1",
        company_id: data.company_id || "New Company",
        cv_id: null,
        recruiter_job_id: null,
        job_title: data.job_title || "Software Engineer",
        job_url: data.job_url || null,
        job_description: data.job_description || null,
        status: data.status || targetColumnStatus,
        custom_status_id: null,
        source: data.source || "linkedin",
        work_format: data.work_format || "remote",
        job_location: data.job_location || "Remote",
        salary_min: data.salary_min || null,
        salary_max: data.salary_max || null,
        salary_currency: "USD",
        priority: data.priority || 3,
        notes: data.notes || null,
        cover_letter: data.cover_letter || null,
        applied_at: data.applied_at || new Date().toISOString().split("T")[0],
        next_interview_at: data.next_interview_at || null,
        deadline_at: null,
        ats_score: {
          score: Math.floor(Math.random() * 15) + 82, // Random ATS match 82-97%
          matched_skills: ["TypeScript", "Next.js"],
          missing_skills: [],
          suggestions: [],
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setApplications((prev) => [newApp, ...prev]);
    }
  };

  const handleDelete = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setIsDialogOpen(false);
  };

  const openAddModal = (status: ApplicationStatus = "wishlist") => {
    setEditingApp(null);
    setTargetColumnStatus(status);
    setIsDialogOpen(true);
  };

  const openEditModal = (app: Application) => {
    setEditingApp(app);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.applications.title}
            <Badge variant="purple" className="text-xs">
              {applications.length} Tracked
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.applications.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Switcher */}
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-1">
            <Button
              size="sm"
              variant={viewMode === "kanban" ? "default" : "ghost"}
              onClick={() => setViewMode("kanban")}
              className="h-7 px-3 text-xs gap-1.5"
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>{t.applications.kanbanView}</span>
            </Button>
            <Button
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-7 px-3 text-xs gap-1.5"
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>{t.applications.tableView}</span>
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="h-9 gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-xs shadow-xs"
          >
            <LinkIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.integrations.importJobUrl}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => openAddModal("wishlist")}
            className="h-9 gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            <span>{t.applications.addCard}</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* DND Kanban View */}
      {viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-220px)]">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                applications={groupedApplications[col.id] || []}
                onAddCard={() => openAddModal(col.id)}
                onEditCard={openEditModal}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragApp ? (
              <div className="rotate-2 scale-105 opacity-90 transition-transform">
                <KanbanCard application={activeDragApp} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Table View */
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/80 text-[11px] font-semibold uppercase text-slate-500">
                  <th className="p-3.5 pl-5">Job Title & Company</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Target Salary</th>
                  <th className="p-3.5">Format</th>
                  <th className="p-3.5">ATS Match</th>
                  <th className="p-3.5">Applied Date</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {filteredApplications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => openEditModal(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-5 font-medium text-slate-900 dark:text-white">
                      <div>{app.job_title}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                        {app.company_id}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="purple" className="text-[10px] capitalize">
                        {(t.applications.stages as Record<string, string>)[app.status] || app.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {fmt.formatSalaryCompact(app.salary_min || 140000, app.salary_max, app.salary_currency || "USD")}
                    </td>
                    <td className="p-3.5 text-slate-500 capitalize">{app.work_format === "remote" ? t.common.remote : app.work_format === "hybrid" ? t.common.hybrid : app.work_format === "onsite" ? t.common.onsite : app.work_format || t.common.remote}</td>
                    <td className="p-3.5">
                      {app.ats_score ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {fmt.formatPercent(app.ats_score.score, 0)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">{app.applied_at ? fmt.formatDate(app.applied_at) : "—"}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-white">
                        {t.common.edit}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Slide-over / Modal Dialog */}
      <ApplicationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        application={editingApp}
        initialStatus={targetColumnStatus}
        onSave={handleCreateOrUpdate}
        onDelete={handleDelete}
      />

      {/* In-App Job URL Importer Modal */}
      <JobUrlImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onJobImported={(newJob) => {
          setApplications((prev) => [newJob, ...prev]);
        }}
      />
    </div>
  );
}
