"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  Sparkles,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  GripVertical,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Application } from "@/types/database";
import { safeHref } from "@/lib/utils";

interface KanbanCardProps {
  application: Application;
  onEdit?: (app: Application) => void;
}

export function KanbanCard({ application, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
  };

  const atsScore = application.ats_score?.score;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none select-none"
    >
      <Card
        onClick={() => {
          if (!isDragging) {
            onEdit?.(application);
          }
        }}
        className="group relative border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-3.5 shadow-sm transition-all duration-150 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900 hover:shadow-indigo-500/5 active:cursor-grabbing"
      >
        {/* Top Row: Company & ATS Match */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300 p-0.5 -ml-1 rounded transition-colors">
              <GripVertical className="h-3.5 w-3.5" />
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {application.company_id || "Company"}
              </span>
              {application.job_url && (
                <a
                  href={safeHref(application.job_url)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {atsScore != null && (
            <div className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sparkles className="h-2.5 w-2.5" />
              <span>{atsScore}%</span>
            </div>
          )}
        </div>

        {/* Role Title */}
        <h4 className="mt-1 text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-200 transition-colors line-clamp-1">
          {application.job_title}
        </h4>

        {/* Middle Metadata: Salary & Location */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {application.salary_min && application.salary_max
              ? `$${(application.salary_min / 1000).toFixed(0)}k - $${(application.salary_max / 1000).toFixed(0)}k`
              : application.salary_min
              ? `$${(application.salary_min / 1000).toFixed(0)}k+`
              : "Salary unlisted"}
          </span>
          <span className="text-slate-400 dark:text-slate-500 truncate max-w-[90px]">
            {application.job_location || application.work_format}
          </span>
        </div>

        {/* Bottom: Priority stars & dates */}
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[10px] text-slate-400 dark:text-slate-500">
          {/* Priority Stars */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 ${
                  i < (application.priority || 3)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300 dark:text-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Date info */}
          {application.next_interview_at ? (
            <span className="font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Calendar className="h-2.5 w-2.5" />
              Interview
            </span>
          ) : application.applied_at ? (
            <span>Applied {application.applied_at}</span>
          ) : (
            <span className="text-slate-400 dark:text-slate-600">Wishlist</span>
          )}
        </div>
      </Card>
    </div>
  );
}
