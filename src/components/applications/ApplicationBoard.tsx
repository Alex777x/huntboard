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
  Search,
  Sparkles,
  Link as LinkIcon,
  AlertCircle,
  X,
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
import { createClient } from "@/lib/supabase/client";

const columnIds: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "rejected",
];

export function ApplicationBoard() {
  const { t, locale, fmt } = useI18n();
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false })
          .limit(200);

        if (error) throw error;
        if (data) setApplications(data as Application[]);
      } catch (err: unknown) {
        console.error("Failed to fetch applications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [supabase]);

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
        distance: 5,
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
        (a.company_name && localeIncludes(a.company_name, search, locale)) ||
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
        const previousApps = applications;
        setApplications((prev) =>
          prev.map((app) =>
            app.id === activeId
              ? { ...app, status: newStatus, updated_at: new Date().toISOString() }
              : app
          )
        );
        supabase
          .from("applications")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", activeId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to update status in database:", error);
              setApplications(previousApps);
              setErrorMessage(error.message);
            }
          });
      }
      return;
    }

    // Dropped on another card
    const overApp = applications.find((a) => a.id === overId);
    if (overApp) {
      if (activeApp.status !== overApp.status) {
        // Move to new column
        const previousApps = applications;
        setApplications((prev) =>
          prev.map((app) =>
            app.id === activeId
              ? { ...app, status: overApp.status, updated_at: new Date().toISOString() }
              : app
          )
        );
        supabase
          .from("applications")
          .update({ status: overApp.status, updated_at: new Date().toISOString() })
          .eq("id", activeId)
          .then(({ error }) => {
            if (error) {
              console.error("Failed to update status in database:", error);
              setApplications(previousApps);
              setErrorMessage(error.message);
            }
          });
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

  const createApplication = React.useCallback(async (data: Partial<Application>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const profileId = user?.id || "00000000-0000-0000-0000-000000000001";
    const companyName = data.company_name || data.company_id || "Company";

    const newAppPayload = {
      profile_id: profileId,
      company_name: companyName,
      company_id: null,
      cv_id: data.cv_id || null,
      recruiter_job_id: data.recruiter_job_id || null,
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
      salary_currency: data.salary_currency || "USD",
      priority: data.priority || 3,
      notes: data.notes || null,
      cover_letter: data.cover_letter || null,
      applied_at: data.applied_at || new Date().toISOString().split("T")[0],
      next_interview_at: data.next_interview_at || null,
      deadline_at: null,
      ats_score: null,
    };

    if (user) {
      const { data: inserted, error } = await supabase
        .from("applications")
        .insert(newAppPayload)
        .select()
        .single();

      if (error) {
        console.error("Error inserting application into DB:", error);
        setErrorMessage(error.message);
        return;
      }
      if (inserted) {
        setApplications((prev) => [inserted as Application, ...prev]);
        return;
      }
    }

    // Fallback optimistic local item if offline or unauthenticated preview
    const fallbackApp: Application = {
      ...newAppPayload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setApplications((prev) => [fallbackApp, ...prev]);
  }, [supabase, targetColumnStatus]);

  const updateApplication = React.useCallback(async (id: string, data: Partial<Application>) => {
    const previousApps = applications;
    const companyName = data.company_name || data.company_id;

    setApplications((prev) =>
      prev.map((a) =>
        a.id === id
          ? ({ ...a, ...data, company_name: companyName || a.company_name, updated_at: new Date().toISOString() } as Application)
          : a
      )
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const updatePayload: Record<string, unknown> = {
        ...data,
        company_name: companyName,
        company_id: null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", id);

      if (error) {
        console.error("Error updating application in DB:", error);
        setApplications(previousApps);
        setErrorMessage(error.message);
      }
    }
  }, [applications, supabase]);

  const handleDelete = React.useCallback(async (id: string) => {
    const previousApps = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setIsDialogOpen(false);
    setEditingApp(null);
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      console.error("Error deleting application from DB:", error);
      setApplications(previousApps);
      setErrorMessage(error.message);
    }
  }, [applications, supabase]);

  const openAddModal = React.useCallback((status: ApplicationStatus = "wishlist") => {
    setEditingApp(null);
    setTargetColumnStatus(status);
    setIsDialogOpen(true);
  }, []);

  const openEditModal = React.useCallback((app: Application) => {
    setEditingApp(app);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsDialogOpen(false);
    setEditingApp(null);
  }, []);

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

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center justify-between gap-3 animate-in fade-in-0 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
        {loading && (
          <span className="text-xs text-slate-400 animate-pulse">{t.common.loading}</span>
        )}
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
                onAddCard={openAddModal}
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
                {filteredApplications.map((app) => {
                  const formatLabels: Record<string, string> = {
                    remote: t.common.remote,
                    hybrid: t.common.hybrid,
                    onsite: t.common.onsite,
                  };
                  const workFormatLabel = formatLabels[app.work_format || ""] || app.work_format || t.common.remote;
                  return (
                  <tr
                    key={app.id}
                    onClick={() => openEditModal(app)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-5 font-medium text-slate-900 dark:text-white">
                      <div>{app.job_title}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                        {app.company_name || app.company_id || "—"}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="purple" className="text-[10px] capitalize">
                        {(t.applications.stages as Record<string, string>)[app.status] || app.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-200">
                      {app.salary_min
                        ? fmt.formatSalaryCompact(app.salary_min, app.salary_max, app.salary_currency || "USD")
                        : t.applications.salaryUnlisted}
                    </td>
                    <td className="p-3.5 text-slate-500 capitalize">{workFormatLabel}</td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Slide-over / Modal Dialog */}
      <ApplicationDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        application={editingApp}
        initialStatus={targetColumnStatus}
        onSave={(data) => {
          if (editingApp) {
            updateApplication(editingApp.id, data);
          } else {
            createApplication(data);
          }
        }}
        onDelete={handleDelete}
      />

      {/* In-App Job URL Importer Modal */}
      <JobUrlImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onJobImported={(newJob) => {
          setEditingApp(null);
          createApplication(newJob);
        }}
      />
    </div>
  );
}
