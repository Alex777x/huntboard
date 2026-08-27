"use client";

import * as React from "react";
import {
  X,
  Plus,
  Building,
  Briefcase,
  Link as LinkIcon,
  Globe,
  MapPin,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/I18nProvider";

export interface CommunityJobPost {
  id: string;
  authorName: string;
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  workFormat: "remote" | "hybrid" | "onsite";
  location: string;
  description: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  userVote?: "up" | "down" | null;
  isVerifiedRecruiter: boolean;
  postedDate: string;
}

interface NewPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Omit<CommunityJobPost, "id" | "upvotes" | "downvotes" | "postedDate">) => void;
  authorName?: string;
}

export function NewPostDialog({ isOpen, onClose, onPostCreated, authorName = "Anonymous User" }: NewPostDialogProps) {
  const { t } = useI18n();
  const [companyName, setCompanyName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [jobUrl, setJobUrl] = React.useState("");
  const [workFormat, setWorkFormat] = React.useState<"remote" | "hybrid" | "onsite">("remote");
  const [location, setLocation] = React.useState("Remote");
  const [description, setDescription] = React.useState("");
  const [tagInput, setTagInput] = React.useState("");
  const [tags, setTags] = React.useState<string[]>(["Next.js", "TypeScript"]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!tagInput.trim() || tags.some(t => t.toLowerCase() === tagInput.trim().toLowerCase())) return;
    setTags([...tags, tagInput.trim()]);
    setTagInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) return;

    onPostCreated({
      authorName,
      companyName,
      jobTitle,
      jobUrl,
      workFormat,
      location,
      description,
      tags,
      isVerifiedRecruiter: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t.community.postJob}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Help fellow candidates discover great engineering and product opportunities
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
              <Input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Linear, Supabase"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Job Title *</label>
              <Input
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Application Link (URL)</label>
            <Input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://company.com/careers/..."
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Format</label>
              <select
                value={workFormat}
                onChange={(e) => setWorkFormat(e.target.value as typeof workFormat)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. EU / Remote"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Why is this role great? (Summary)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlights on salary, tech stack, team culture..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Tech Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. Next.js, Postgres (Enter)"
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 flex-1"
              />
              <Button type="button" size="sm" onClick={handleAddTag} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  className="cursor-pointer rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] text-slate-700 dark:text-slate-200 hover:text-red-500"
                >
                  {t} ×
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white">
              {t.common.cancel}
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md">
              <Save className="h-3.5 w-3.5" />
              <span>Share Vacancy</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
