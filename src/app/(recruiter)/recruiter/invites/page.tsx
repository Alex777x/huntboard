"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

interface SentInvite {
  id: string;
  candidateName: string;
  candidateRole: string;
  jobTitle: string;
  companyName: string;
  sentDate: string;
  status: "pending" | "accepted" | "declined";
  message: string;
}

export default function RecruiterInvitesPage() {
  const { t } = useI18n();
  const [invites, setInvites] = React.useState<SentInvite[]>([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }
      
      const { data, error } = await supabase
        .from("invites")
        .select(`
          id,
          message,
          status,
          created_at,
          receiver:profiles!receiver_id (full_name, current_role),
          job:recruiter_jobs!recruiter_job_id (title, company_name)
        `)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });
        
      if (data && !error) {
        setInvites(data.map((d: any) => ({
          id: d.id,
          candidateName: d.receiver?.full_name || "Unknown Candidate",
          candidateRole: d.receiver?.current_role || "Candidate",
          jobTitle: d.job?.title || "Unknown Job",
          companyName: d.job?.company_name || "Unknown Company",
          sentDate: new Date(d.created_at).toLocaleDateString(),
          status: d.status,
          message: d.message,
        })));
      }
    }
    fetchData();
  }, []);

  const filtered = invites.filter((inv) =>
    inv.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    inv.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.recruiter.invitesTitle}
          <Badge variant="purple" className="text-xs">
            {invites.length} {t.recruiter.sentInvitesCount}
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.recruiter.trackResponses}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.recruiter.searchInvitesPlaceholder}
          className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((inv) => (
          <Card
            key={inv.id}
            className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-3 hover:border-purple-500/40 transition-all shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-purple-500/30">
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                    {inv.candidateName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{inv.candidateName}</h3>
                  <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">{inv.candidateRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.recruiter.forVacancy} <strong className="text-slate-800 dark:text-slate-200">{inv.jobTitle}</strong></span>
                {inv.status === "accepted" && (
                  <Badge variant="success" className="text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t.recruiter.acceptedStatus}
                  </Badge>
                )}
                {inv.status === "pending" && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Clock className="h-3 w-3" />
                    {t.recruiter.pendingStatus}
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              &quot;{inv.message}&quot;
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500">
              <span>{t.recruiter.sentInvitesCount} {inv.sentDate}</span>
              <span>{inv.status === "accepted" ? t.recruiter.candidateConnected : t.recruiter.awaitingResponse}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
