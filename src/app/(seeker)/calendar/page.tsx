"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  X,
  Save,
  Trash2,
  Download,
  CalendarPlus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";
import { safeHref } from "@/lib/utils";
import {
  CalendarEventItem,
  generateGoogleCalendarUrl,
  generateIcsContent,
  downloadIcsFile,
} from "@/lib/calendar/ical";
import { createClient } from "@/lib/supabase/client";
import { Event as DbEvent } from "@/types/database";

export default function CalendarPage() {
  const { t, fmt } = useI18n();
  const [events, setEvents] = React.useState<CalendarEventItem[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEvent, setEditingEvent] = React.useState<CalendarEventItem | null>(null);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("events")
          .select("*").limit(100)
          .eq("profile_id", user.id)
          .order("event_date", { ascending: true });

        if (error) throw error;
        if (data) {
          const mapped: CalendarEventItem[] = (data as DbEvent[]).map((ev) => ({
            id: ev.id,
            title: ev.title,
            companyName: ev.company_name || "",
            type: ev.event_type || "",
            date: ev.event_date,
            time: ev.time_range || "",
            meetUrl: ev.video_link || undefined,
            interviewers: ev.interviewers || undefined,
            notes: ev.notes || undefined,
          }));
          setEvents(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, []);

  // Form State
  const [title, setTitle] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [type, setType] = React.useState<string>("Technical Interview");
  const [date, setDate] = React.useState("2026-08-30");
  const [time, setTime] = React.useState("15:00 (CET)");
  const [meetUrl, setMeetUrl] = React.useState("");
  const [interviewers, setInterviewers] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleOpenAdd = () => {
    setEditingEvent(null);
    setTitle("");
    setCompanyName("");
    setType("Technical Interview");
    setDate(new Date().toISOString().split("T")[0]);
    setTime("15:00 (CET)");
    setMeetUrl("");
    setInterviewers("");
    setNotes("");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (ev: CalendarEventItem) => {
    setEditingEvent(ev);
    setTitle(ev.title);
    setCompanyName(ev.companyName);
    setType(ev.type);
    setDate(ev.date);
    setTime(ev.time);
    setMeetUrl(ev.meetUrl || "");
    setInterviewers(ev.interviewers || "");
    setNotes(ev.notes || "");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const previousEvents = events;

    if (editingEvent) {
      const updated = events.map((ev) =>
        ev.id === editingEvent.id
          ? { ...ev, title, companyName, type, date, time, meetUrl, interviewers, notes }
          : ev
      );
      setEvents(updated);
      setIsDialogOpen(false);
      if (user) {
        const { error } = await supabase
          .from("events")
          .update({
            title,
            company_name: companyName,
            event_type: type,
            event_date: date,
            time_range: time,
            video_link: meetUrl || null,
            interviewers: interviewers || null,
            notes: notes || null,
          })
          .eq("id", editingEvent.id);
        if (error) {
          console.error("Error updating event:", error);
          setEvents(previousEvents);
          setErrorMessage(error.message);
        }
      }
    } else {
      const profileId = user?.id || "00000000-0000-0000-0000-000000000001";
      const payload = {
        profile_id: profileId,
        title,
        company_name: companyName,
        event_type: type,
        event_date: date,
        time_range: time,
        video_link: meetUrl || null,
        interviewers: interviewers || "Hiring Team",
        notes: notes || null,
        status: "pending",
      };

      if (user) {
        const { data: inserted, error } = await supabase
          .from("events")
          .insert(payload)
          .select()
          .single();

        if (error) {
          console.error("Error inserting event:", error);
          setErrorMessage(error.message);
          return;
        }

        if (inserted) {
          const newEv: CalendarEventItem = {
            id: inserted.id,
            title: inserted.title,
            companyName: inserted.company_name || "",
            type: (inserted.event_type as any) || "Technical Interview",
            date: inserted.event_date,
            time: inserted.time_range || "",
            meetUrl: inserted.video_link || undefined,
            interviewers: inserted.interviewers || undefined,
            notes: inserted.notes || undefined,
          };
          setEvents([newEv, ...events]);
          setIsDialogOpen(false);
          return;
        }
      }

      const fallbackEv: CalendarEventItem = {
        id: crypto.randomUUID(),
        title,
        companyName,
        type: type as any,
        date,
        time,
        meetUrl: meetUrl || undefined,
        interviewers: interviewers || "Hiring Team",
        notes,
      };
      setEvents([fallbackEv, ...events]);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const previousEvents = events;
    setEvents(events.filter((ev) => ev.id !== id));
    setIsDialogOpen(false);
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("Error deleting event:", error);
      setEvents(previousEvents);
      setErrorMessage(error.message);
    }
  };

  const handleExportAllIcs = () => {
    const icsContent = generateIcsContent(events);
    downloadIcsFile("huntboard_interviews.ics", icsContent);
  };

  return (
    <div className="w-full space-y-6">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.calendar.title}
            <Badge variant="purple" className="text-xs">
              {events.length} {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.calendar.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleExportAllIcs}
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t.calendar.exportIcs}</span>
          </Button>

          <Button
            onClick={handleOpenAdd}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
          >
            <Plus className="h-4 w-4" />
            <span>{t.calendar.addEvent}</span>
          </Button>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {events.map((ev) => {
          const gCalUrl = generateGoogleCalendarUrl(ev);

          return (
            <Card
              key={ev.id}
              onClick={() => handleOpenEdit(ev)}
              className="cursor-pointer border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 space-y-3.5 hover:border-indigo-500/50 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {ev.companyName}
                    </span>
                    <Badge
                      variant={
                        ev.type === "Offer Deadline"
                          ? "success"
                          : ev.type === "Follow-up Reminder"
                          ? "warning"
                          : "purple"
                      }
                      className="text-[10px]"
                    >
                      {ev.type}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {ev.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <CalendarIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-purple-400" />
                      {fmt.formatDate(ev.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {ev.time}
                    </span>
                    {ev.interviewers && (
                      <>
                        <span>•</span>
                        <span>{t.calendar.interviewers} {ev.interviewers}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Google Calendar 1-Click Link */}
                  <a
                    href={gCalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t.calendar.addToGoogleCalendar}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{t.calendar.addToGoogleCalendar}</span>
                    </Button>
                  </a>

                  {ev.meetUrl && (
                    <a
                      href={safeHref(ev.meetUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-xs"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>{t.calendar.joinMeeting}</span>
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {ev.notes && (
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed font-sans">
                  <span className="font-semibold text-slate-900 dark:text-slate-200 block mb-0.5">{t.calendar.notes}</span>
                  {ev.notes}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in-0">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                {editingEvent ? "Edit Interview Event" : "Schedule Interview Event"}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
                  <Input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Event Title *</label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. System Design Panel"
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Stage Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2 py-2 text-xs text-slate-900 dark:text-slate-200"
                  >
                    <option value="HR Screen">HR Screen</option>
                    <option value="Technical Interview">Technical Interview</option>
                    <option value="System Design">System Design</option>
                    <option value="Follow-up Reminder">Follow-up Reminder</option>
                    <option value="Offer Deadline">Offer Deadline</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Date (YYYY-MM-DD)</label>
                  <Input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Time / Timezone</label>
                  <Input
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="16:00 (CET)"
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Video Call URL</label>
                  <Input
                    type="url"
                    value={meetUrl}
                    onChange={(e) => setMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Interviewers / Contacts</label>
                  <Input
                    value={interviewers}
                    onChange={(e) => setInterviewers(e.target.value)}
                    placeholder="Jessica Miller, David Chen"
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Preparation Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Questions to ask, topics to review..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
                {editingEvent ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(editingEvent.id)}
                    className="text-xs gap-1"
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
                    onClick={() => setIsDialogOpen(false)}
                    className="text-xs text-slate-500"
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{editingEvent ? t.common.saveChanges : "Save Event"}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
