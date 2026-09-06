"use client";

import * as React from "react";
import {
  MessageSquarePlus,
  Bug,
  Lightbulb,
  MessageCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  AlertCircle,
  ArrowUpRight,
  Filter,
  Puzzle,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeedbackTicket } from "@/types/feedback";
import { useI18n } from "@/components/providers/I18nProvider";

const initialTickets: FeedbackTicket[] = [
  {
    id: "fb-1",
    type: "feature",
    title: "Phase 4: LinkedIn Chrome Extension (Manifest V3)",
    description: "1-Click capture of job postings from LinkedIn, Indeed, and Glassdoor directly into the Kanban pipeline.",
    severity: "high",
    status: "resolved",
    userEmail: "anatoli@example.com",
    userName: "HuntBoard Team",
    createdAt: "Today",
    upvotes: 42,
    adminNotes: "Implemented with Manifest V3 and In-App URL Parser.",
  },
  {
    id: "fb-2",
    type: "feature",
    title: "Phase 4: Google Calendar 1-Click Sync & .ICS Export",
    description: "Export interview rounds directly to Google Calendar and download universal .ICS calendar files.",
    severity: "high",
    status: "resolved",
    userEmail: "anatoli@example.com",
    userName: "HuntBoard Team",
    createdAt: "Today",
    upvotes: 38,
    adminNotes: "Live on /calendar with single & batch .ICS export.",
  },
  {
    id: "fb-3",
    type: "feature",
    title: "Phase 4: Telegram Instant Alerts for Recruiter Invites",
    description: "Receive instant notifications in Telegram whenever a verified employer sends a direct interview invitation.",
    severity: "high",
    status: "resolved",
    userEmail: "anatoli@example.com",
    userName: "HuntBoard Team",
    createdAt: "Today",
    upvotes: 35,
    adminNotes: "Live in Settings -> Integrations with Bot API test runner.",
  },
  {
    id: "fb-4",
    type: "feature",
    title: "Support for custom color tags on Kanban cards",
    description: "It would be great to define custom color codes for tags like 'High Priority', 'Referral', or 'Remote EU'.",
    severity: "medium",
    status: "planned",
    userEmail: "anatoli@example.com",
    userName: "Anatoli Liaksandrou",
    createdAt: "Aug 24, 2026",
    upvotes: 18,
    adminNotes: "Scheduled for release in next minor update.",
  },
  {
    id: "fb-5",
    type: "bug",
    title: "ATS Scorer score bar layout on narrow mobile screens",
    description: "On mobile screen sizes under 360px, the match percentage badge wraps awkwardly.",
    severity: "low",
    status: "resolved",
    userEmail: "marek@example.com",
    userName: "Marek K.",
    createdAt: "Aug 22, 2026",
    upvotes: 4,
    adminNotes: "Fixed in CSS media queries.",
  },
];

const ROADMAP_PHASES = [
  {
    phase: "Phase 1",
    title: "Seeker Core MVP",
    desc: "Kanban Pipeline, Structured CV Editor, PDF Export & AI Copilot",
    status: "Completed",
    badge: "success",
  },
  {
    phase: "Phase 2",
    title: "Recruiter Portal & ATS-Lite",
    desc: "Job Vacancies, Talent Discovery, Stage Pipeline & Direct Invites",
    status: "Completed",
    badge: "success",
  },
  {
    phase: "Phase 3",
    title: "Community, Feedback & i18n",
    desc: "Community Job Board, Upvotes, EN/RU/PL Localization & Dark/Light Themes",
    status: "Completed",
    badge: "success",
  },
  {
    phase: "Phase 4",
    title: "Integrations & Automation",
    desc: "LinkedIn Chrome Extension, Google Calendar & .ICS Sync, Telegram Bot Alerts",
    status: "Live 🚀",
    badge: "purple",
  },
];

export default function FeedbackPage() {
  const { t, locale, fmt } = useI18n();
  const [tickets, setTickets] = React.useState<FeedbackTicket[]>(initialTickets);
  const [activeTab, setActiveTab] = React.useState<"roadmap" | "form">("roadmap");

  // Form fields
  const [feedbackType, setFeedbackType] = React.useState<"feature" | "bug" | "general">("feature");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [severity, setSeverity] = React.useState<"low" | "medium" | "high" | "critical">("medium");
  const [userEmail, setUserEmail] = React.useState("anatoli@example.com");
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const newTicket: FeedbackTicket = {
      id: `fb-${Date.now()}`,
      type: feedbackType,
      title,
      description,
      severity,
      status: "pending",
      userEmail,
      userName: "Anatoli Liaksandrou",
      createdAt: t.common.justNow,
      upvotes: 1,
    };

    setTickets([newTicket, ...tickets]);
    setIsSuccess(true);
    setTitle("");
    setDescription("");
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.feedback.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.feedback.subtitle}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-1 self-start">
          <Button
            size="sm"
            variant={activeTab === "roadmap" ? "default" : "ghost"}
            onClick={() => setActiveTab("roadmap")}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t.feedback.tabRoadmap}</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "form" ? "default" : "ghost"}
            onClick={() => setActiveTab("form")}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{t.feedback.tabSubmit}</span>
          </Button>
        </div>
      </div>

      {/* Tab 1: Roadmap & Timeline */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          {/* Official Roadmap Phases Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Platform Development Lifecycle & Phases</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ROADMAP_PHASES.map((p, idx) => (
                <Card
                  key={idx}
                  className={`p-4 space-y-2 border transition-all ${
                    p.badge === "purple"
                      ? "border-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm ring-1 ring-indigo-500/20"
                      : "border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {p.phase}
                    </span>
                    <Badge
                      variant={p.badge === "purple" ? "purple" : "success"}
                      className="text-[10px] gap-1"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {p.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {p.desc}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Community Feedback Tickets */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Community Feature Requests & Tickets</span>
            </h3>

            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-3 hover:border-indigo-500/40 transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {ticket.type === "feature" ? (
                          <Badge variant="purple" className="text-[10px] gap-1">
                            <Lightbulb className="h-3 w-3" />
                            Feature
                          </Badge>
                        ) : ticket.type === "bug" ? (
                          <Badge variant="destructive" className="text-[10px] gap-1">
                            <Bug className="h-3 w-3" />
                            Bug
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Feedback
                          </Badge>
                        )}

                        <span className="text-xs text-slate-400">• {ticket.createdAt} by {ticket.userName}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {ticket.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ticket.status === "planned" && (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <Sparkles className="h-3 w-3" />
                          {t.feedback.statusPlanned}
                        </Badge>
                      )}
                      {ticket.status === "in_review" && (
                        <Badge variant="purple" className="text-[10px] gap-1">
                          <Clock className="h-3 w-3" />
                          {t.feedback.statusPending}
                        </Badge>
                      )}
                      {ticket.status === "resolved" && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.feedback.statusResolved}
                        </Badge>
                      )}
                      {ticket.status === "pending" && (
                        <Badge variant="secondary" className="text-[10px]">
                          New Submission
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed font-sans">
                    {ticket.description}
                  </p>

                  {ticket.adminNotes && (
                    <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 p-2.5 rounded-lg flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span><strong>Team response:</strong> {ticket.adminNotes}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Submit Form */}
      {activeTab === "form" && (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
          {isSuccess && (
            <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Thank you! Your feedback has been logged to the public roadmap.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Feedback Type Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Ticket Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "feature", label: t.feedback.typeFeature },
                  { id: "bug", label: t.feedback.typeBug },
                  { id: "general", label: t.feedback.typeGeneral },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFeedbackType(cat.id as any)}
                    className={`rounded-xl border p-3 text-xs font-semibold text-center transition-all ${
                      feedbackType === cat.id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/50"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {feedbackType === "bug" ? "Issue Summary / Bug Title *" : "Feature Name / Summary *"}
                </label>
                <Input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    feedbackType === "bug"
                      ? "e.g. Export PDF cuts off 2nd page on Safari"
                      : "e.g. Add dark/light mode toggle in mobile header"
                  }
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Your Email for Status Updates *
                </label>
                <Input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Severity (only for bugs) */}
            {feedbackType === "bug" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-200"
                >
                  <option value="low">Low (Minor visual glitch)</option>
                  <option value="medium">Medium (Annoying but workaround exists)</option>
                  <option value="high">High (Feature does not work as expected)</option>
                  <option value="critical">Critical (Blocking job application flow)</option>
                </select>
              </div>
            )}

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Detailed Description & Steps to Reproduce *
              </label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  feedbackType === "bug"
                    ? "1. Go to '/cv'\n2. Click 'Print / Save as PDF'\n3. Notice the header margin...\n(Expected vs Actual behavior)"
                    : "Describe what problem this solves and how you envision the feature working..."
                }
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t.feedback.submit}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
