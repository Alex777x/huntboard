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
    id: "fb-2",
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
  {
    id: "fb-3",
    type: "feature",
    title: "Direct LinkedIn Job URL autofill parser",
    description: "Paste a LinkedIn URL and automatically populate job title, company, and location into the modal.",
    severity: "high",
    status: "in_review",
    userEmail: "elena@example.com",
    userName: "Elena R.",
    createdAt: "Aug 25, 2026",
    upvotes: 24,
  },
];

export default function FeedbackPage() {
  const { t } = useI18n();
  const [tickets, setTickets] = React.useState<FeedbackTicket[]>(initialTickets);
  const [activeTab, setActiveTab] = React.useState<"form" | "roadmap">("form");

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
      createdAt: "Just now",
      upvotes: 1,
    };

    setTickets([newTicket, ...tickets]);
    setIsSuccess(true);
    setTitle("");
    setDescription("");
    setTimeout(() => setIsSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {t.feedback.title}
            <Badge variant="purple" className="text-xs">
              Direct to Engineering
            </Badge>
          </h1>
          <p className="text-xs text-slate-400">
            {t.feedback.subtitle}
          </p>
        </div>

        <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 p-1">
          <Button
            size="sm"
            variant={activeTab === "form" ? "default" : "ghost"}
            onClick={() => setActiveTab("form")}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>{t.feedback.tabSubmit}</span>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "roadmap" ? "default" : "ghost"}
            onClick={() => setActiveTab("roadmap")}
            className="h-7 px-3 text-xs gap-1.5"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>{t.feedback.tabRoadmap} ({tickets.length})</span>
          </Button>
        </div>
      </div>

      {isSuccess && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2.5 animate-in fade-in-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Thank you! Your {feedbackType === "bug" ? "bug report" : "feature request"} has been submitted directly to our roadmap queue.
          </span>
        </div>
      )}

      {/* Tab: Submission Form */}
      {activeTab === "form" && (
        <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                What would you like to submit? *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "feature", label: t.feedback.typeFeature, icon: Lightbulb, color: "text-amber-400" },
                  { id: "bug", label: t.feedback.typeBug, icon: Bug, color: "text-red-400" },
                  { id: "general", label: t.feedback.typeGeneral, icon: MessageCircle, color: "text-indigo-400" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFeedbackType(item.id as typeof feedbackType)}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      feedbackType === item.id
                        ? "border-indigo-500 bg-indigo-950/40 text-white shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500"
                        : "border-slate-800 bg-slate-950/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
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
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Your Email for Status Updates *
                </label>
                <Input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Severity (only for bugs) */}
            {feedbackType === "bug" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
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
              <label className="text-xs font-medium text-slate-300">
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
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{t.feedback.submit}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab: Roadmap / Community Tickets */}
      {activeTab === "roadmap" && (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="border-slate-800/80 bg-slate-900/40 p-5 space-y-3 hover:border-indigo-500/40 transition-all"
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

                    <span className="text-xs text-slate-500">• {ticket.createdAt} by {ticket.userName}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1">
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
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 gap-1">
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

              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
                {ticket.description}
              </p>

              {ticket.adminNotes && (
                <div className="text-[11px] text-indigo-300 bg-indigo-950/30 border border-indigo-500/20 p-2.5 rounded-lg flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span><strong>Team response:</strong> {ticket.adminNotes}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
