"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanCard } from "@/components/applications/KanbanCard";
import { Application, ApplicationStatus } from "@/types/database";

interface KanbanColumnProps {
  id: ApplicationStatus;
  title: string;
  applications: Application[];
  onAddClick?: (status: ApplicationStatus) => void;
  onAddCard?: (status: ApplicationStatus) => void;
  onEditCard?: (app: Application) => void;
}

export function KanbanColumn({
  id,
  title,
  applications,
  onAddClick,
  onAddCard,
  onEditCard,
}: KanbanColumnProps) {
  const handleAdd = () => {
    if (onAddCard) onAddCard(id);
    else if (onAddClick) onAddClick(id);
  };
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl border p-3 min-w-[270px] max-w-[300px] flex-1 backdrop-blur-sm transition-colors duration-150 ${
        isOver
          ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-500/40"
          : "border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-950/50"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {title}
          </span>
          <span className="rounded-full bg-slate-200 dark:bg-slate-800/80 px-2 py-0.2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
            {applications.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdd}
          className="h-6 w-6 text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cards Container */}
      <div className="mt-3 flex-1 space-y-2.5 min-h-[160px]">
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard
              key={app.id}
              application={app}
              onEdit={onEditCard}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div
            onClick={handleAdd}
            className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-600 hover:border-slate-400 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            + Add application
          </div>
        )}
      </div>
    </div>
  );
}
