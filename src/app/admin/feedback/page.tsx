"use client";

import * as React from "react";
import {
  Bug,
  Lightbulb,
  Search,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeedbackTicket } from "@/types/feedback";
import { useI18n } from "@/components/providers/I18nProvider";
import { localeIncludes } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export default function AdminFeedbackPage() {
  const { t, locale } = useI18n();
  const [tickets, setTickets] = React.useState<FeedbackTicket[]>([]);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"all" | "feature" | "bug" | "general">("all");
  const [loading, setLoading] = React.useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function fetchTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("feedback_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setTickets(
          data.map((tk: any) => ({
            id: tk.id,
            type: tk.ticket_type || tk.type || "general",
            title: tk.title,
            description: tk.description || "",
            severity: tk.priority || tk.severity || "medium",
            status: tk.status === "open" ? "pending" : tk.status,
            userEmail: tk.user_email || "",
            userName: tk.user_name || "User",
            createdAt: tk.created_at,
            adminNotes: tk.admin_notes || "",
          }))
        );
      }
      setLoading(false);
    }
    fetchTickets();
  }, [supabase]);

  const updateStatus = async (id: string, newStatus: FeedbackTicket["status"]) => {
    const prevTickets = tickets;
    setTickets(
      tickets.map((tk) => (tk.id === id ? { ...tk, status: newStatus } : tk))
    );
    const dbStatus = newStatus === "pending" ? "open" : newStatus;
    const { error } = await supabase.from("feedback_tickets").update({ status: dbStatus }).eq("id", id);
    if (error) {
      console.error("Failed to update status:", error);
      setTickets(prevTickets);
    }
  };

  const handleNoteChange = (id: string, notes: string) => {
    setTickets((prev) =>
      prev.map((tk) => (tk.id === id ? { ...tk, adminNotes: notes } : tk))
    );
  };

  const persistNotes = async (id: string, notes: string) => {
    const { error } = await supabase
      .from("feedback_tickets")
      .update({ admin_notes: notes })
      .eq("id", id);
    if (error) {
      console.error("Failed to update notes:", error);
    }
  };

  const filtered = tickets.filter((tk) => {
    const matchesSearch =
      localeIncludes(tk.title, search, locale) ||
      localeIncludes(tk.description, search, locale) ||
      localeIncludes(tk.userEmail, search, locale) ||
      localeIncludes(tk.userName, search, locale);
    const matchesType = typeFilter === "all" ? true : tk.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.admin.feedbackTitle}
          <Badge variant="purple" className="text-xs">
            {tickets.length} {t.common.active}
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.admin.feedbackSubtitle}
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by user, title, or keyword..."
            className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
          />
        </div>

        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          {(["all", "feature", "bug", "general"] as const).map((tp) => (
            <button
              key={tp}
              onClick={() => setTypeFilter(tp)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-all ${
                typeFilter === tp
                  ? "bg-purple-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filtered.map((ticket) => (
          <Card
            key={ticket.id}
            className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-4 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {ticket.type === "feature" ? (
                    <Badge variant="purple" className="text-[10px] gap-1">
                      <Lightbulb className="h-3 w-3" />
                      {t.feedback.typeFeature}
                    </Badge>
                  ) : ticket.type === "bug" ? (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <Bug className="h-3 w-3" />
                      {t.feedback.typeBug} ({ticket.severity})
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px]">
                      {t.feedback.typeGeneral}
                    </Badge>
                  )}

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    From: <strong className="text-slate-700 dark:text-slate-200">{ticket.userName}</strong> ({ticket.userEmail}) • {ticket.createdAt}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {ticket.title}
                </h3>
              </div>

              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 dark:text-slate-400">Status:</label>
                <select
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value as FeedbackTicket["status"])}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 capitalize"
                >
                  <option value="pending">{t.feedback.statusPending}</option>
                  <option value="in_review">In Review</option>
                  <option value="planned">{t.feedback.statusPlanned}</option>
                  <option value="resolved">{t.feedback.statusResolved}</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed font-sans">
              {ticket.description}
            </p>

            {/* Team note editor */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                Official Team Response Note
              </label>
              <Input
                value={ticket.adminNotes || ""}
                onChange={(e) => handleNoteChange(ticket.id, e.target.value)}
                onBlur={(e) => persistNotes(ticket.id, e.target.value)}
                placeholder="e.g. Scheduled for next release or under active investigation..."
                className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
