"use client";

import * as React from "react";
import {
  X,
  Building2,
  Globe,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Company } from "@/types/database";

interface CompanyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  company?: Company | null;
  onSave: (company: Partial<Company>) => void;
  onDelete?: (id: string) => void;
}

export function CompanyDialog({
  isOpen,
  onClose,
  company,
  onSave,
  onDelete,
}: CompanyDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Company>>({
    name: "",
    website: "",
    industry: "",
    size: "Mid-size (100-1,000)",
    location: "Remote",
    notes: "",
  });

  React.useEffect(() => {
    if (company) {
      setFormData(company);
    } else {
      setFormData({
        name: "",
        website: "",
        industry: "Technology & Software",
        size: "Mid-size (100-1,000)",
        location: "Remote",
        notes: "",
      });
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            {company ? "Edit Company" : "Add Target Company"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Company Name *</label>
            <Input
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Stripe, Vercel, Supabase"
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Website URL</label>
              <Input
                type="url"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Industry / Domain</label>
              <Input
                value={formData.industry || ""}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Fintech, DevTools"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Company Size</label>
              <select
                value={formData.size || "Mid-size (100-1,000)"}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Seed / Early (<20)">Seed / Early (&lt;20)</option>
                <option value="Startup (20-100)">Startup (20-100)</option>
                <option value="Mid-size (100-1,000)">Mid-size (100-1,000)</option>
                <option value="Enterprise (1,000+) / FAANG">Enterprise (1,000+) / FAANG</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Location / HQ</label>
              <Input
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco / Remote"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Engineering Notes & Culture</label>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Hiring process insights, tech stack, referral connections..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            {company && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(company.id)}
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
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{company ? "Save" : "Add Company"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
