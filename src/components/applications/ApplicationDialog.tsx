"use client";

import * as React from "react";
import {
  X,
  Building2,
  Briefcase,
  Link as LinkIcon,
  DollarSign,
  MapPin,
  Calendar,
  Star,
  Sparkles,
  FileText,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Application, ApplicationStatus, WorkFormat, ApplicationSource } from "@/types/database";

interface ApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  initialStatus?: ApplicationStatus;
  onSave: (app: Partial<Application>) => void;
  onDelete?: (id: string) => void;
}

export function ApplicationDialog({
  isOpen,
  onClose,
  application,
  initialStatus = "wishlist",
  onSave,
  onDelete,
}: ApplicationDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Application>>({
    job_title: "",
    company_id: "",
    job_url: "",
    job_description: "",
    status: initialStatus,
    work_format: "remote",
    job_location: "",
    salary_min: null,
    salary_max: null,
    salary_currency: "USD",
    priority: 3,
    notes: "",
    cover_letter: "",
    applied_at: "",
    source: "linkedin",
  });

  React.useEffect(() => {
    if (application) {
      setFormData(application);
    } else {
      setFormData({
        job_title: "",
        company_id: "",
        job_url: "",
        job_description: "",
        status: initialStatus,
        work_format: "remote",
        job_location: "",
        salary_min: null,
        salary_max: null,
        salary_currency: "USD",
        priority: 3,
        notes: "",
        cover_letter: "",
        applied_at: new Date().toISOString().split("T")[0],
        source: "linkedin",
      });
    }
  }, [application, initialStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title || !formData.company_id) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              {application ? "Edit Application" : "New Job Application"}
            </h2>
            <p className="text-xs text-slate-400">
              Track hiring stages, compensation, and interview dates
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                Company Name *
              </label>
              <Input
                required
                value={formData.company_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company_id: e.target.value })
                }
                placeholder="e.g. Stripe, Vercel, Linear"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                Job Title *
              </label>
              <Input
                required
                value={formData.job_title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, job_title: e.target.value })
                }
                placeholder="e.g. Senior Fullstack Engineer"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Job URL & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5 text-slate-500" />
                Job Vacancy URL
              </label>
              <Input
                type="url"
                value={formData.job_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, job_url: e.target.value })
                }
                placeholder="https://..."
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Source
              </label>
              <select
                value={formData.source || "linkedin"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source: e.target.value as ApplicationSource,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="referral">Referral / Warm intro</option>
                <option value="company_site">Company Careers Page</option>
                <option value="community">Community Board</option>
                <option value="platform">Platform Recruiter Invite</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Status & Work Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Pipeline Status
              </label>
              <select
                value={formData.status || "wishlist"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ApplicationStatus,
                  })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="wishlist">Wishlist (Planning)</option>
                <option value="applied">Applied (Resume Sent)</option>
                <option value="phone_screen">Phone Screen / HR</option>
                <option value="interview">Technical Interview</option>
                <option value="offer">Offer Received 🎉</option>
                <option value="rejected">Rejected / Archived</option>
                <option value="withdrawn">Withdrawn (Self)</option>
                <option value="no_response">No Response (Ghosted)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                Work Format & Location
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["remote", "hybrid", "onsite"] as WorkFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormData({ ...formData, work_format: fmt })}
                    className={`rounded-lg border py-1.5 text-center text-xs font-medium capitalize transition-all ${
                      formData.work_format === fmt
                        ? "border-indigo-500 bg-indigo-950/50 text-indigo-300"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Salary Min / Max & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                Salary Min
              </label>
              <Input
                type="number"
                value={formData.salary_min || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_min: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="e.g. 130000"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                Salary Max
              </label>
              <Input
                type="number"
                value={formData.salary_max || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salary_max: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="e.g. 160000"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Priority Rating
              </label>
              <div className="flex h-9 items-center justify-center gap-1 rounded-lg border border-slate-800 bg-slate-950 px-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: star })}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= (formData.priority || 3)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes & Cover Letter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Personal Notes & Interview Feedback
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (formData.job_title && formData.company_id) {
                    setFormData({
                      ...formData,
                      notes:
                        (formData.notes ? formData.notes + "\n\n" : "") +
                        `[AI Cover Letter Draft Generated for ${formData.job_title} at ${formData.company_id}]`,
                    });
                  }
                }}
                className="h-6 text-[11px] text-purple-400 hover:text-purple-300 gap-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>Auto-Draft Notes</span>
              </Button>
            </div>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Key notes, interview impressions, referral name, questions to ask..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            {application && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(application.id)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
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
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{application ? "Save Changes" : "Create Application"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
