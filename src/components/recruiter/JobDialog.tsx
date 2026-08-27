"use client";

import * as React from "react";
import {
  X,
  Briefcase,
  Building,
  DollarSign,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecruiterJob, WorkFormat } from "@/types/database";
import { useI18n } from "@/components/providers/I18nProvider";

export type { RecruiterJob };

interface JobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job?: RecruiterJob | null;
  onSave: (job: Partial<RecruiterJob>) => void;
  onDelete?: (id: string) => void;
}

export function JobDialog({
  isOpen,
  onClose,
  job,
  onSave,
  onDelete,
}: JobDialogProps) {
  const { t } = useI18n();
  const [formData, setFormData] = React.useState<Partial<RecruiterJob>>({
    title: "",
    company_name: "Stripe",
    department: "Engineering",
    work_format: "remote",
    location: "Remote (EU / US)",
    salary_min: 140000,
    salary_max: 180000,
    description: "",
    requirements: "",
    status: "active",
    published_to_community: true,
  });

  React.useEffect(() => {
    if (job) {
      setFormData(job);
    } else {
      setFormData({
        title: "",
        company_name: "Stripe",
        department: "Engineering",
        work_format: "remote",
        location: "Remote (EU / US)",
        salary_min: 140000,
        salary_max: 180000,
        description: "",
        requirements: "",
        status: "active",
        published_to_community: true,
      });
    }
  }, [job, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company_name) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-purple-400" />
              {job ? t.recruiter.dialog.editTitle : t.recruiter.dialog.postNewTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.recruiter.dialog.dialogSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.jobTitle}
              </label>
              <Input
                required
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior Frontend Engineer"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.companyName}
              </label>
              <Input
                required
                value={formData.company_name || ""}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="e.g. Stripe"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.workFormat}
              </label>
              <select
                value={formData.work_format || "remote"}
                onChange={(e) => setFormData({ ...formData, work_format: e.target.value as WorkFormat })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="remote">{t.common.remote}</option>
                <option value="hybrid">{t.common.hybrid}</option>
                <option value="onsite">{t.common.onsite}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.location}
              </label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco or Remote"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.status}
              </label>
              <select
                value={formData.status || "active"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "paused" | "closed" })}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
              >
                <option value="active">{t.common.active}</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed / Filled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.salaryMin}
              </label>
              <Input
                type="number"
                value={formData.salary_min || ""}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="e.g. 140000"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {t.recruiter.dialog.salaryMax}
              </label>
              <Input
                type="number"
                value={formData.salary_max || ""}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="e.g. 180000"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.recruiter.dialog.description}
            </label>
            <textarea
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="About the team, key responsibilities..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {t.recruiter.dialog.requirements}
            </label>
            <textarea
              rows={3}
              value={formData.requirements || ""}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="• Required experience, stack, competencies..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="pub"
              checked={formData.published_to_community}
              onChange={(e) => setFormData({ ...formData, published_to_community: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="pub" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              {t.recruiter.dialog.publishCommunity}
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
            {job && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(job.id)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.common.delete}</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{job ? t.common.saveChanges : t.recruiter.dialog.publishBtn}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
