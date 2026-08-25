"use client";

import * as React from "react";
import {
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Building,
  Briefcase,
  User,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const initialSentInvites: SentInvite[] = [
  {
    id: "inv-1",
    candidateName: "Anatoli Liaksandrou",
    candidateRole: "Senior Fullstack Engineer",
    jobTitle: "Senior Fullstack Engineer (Payments)",
    companyName: "Stripe",
    sentDate: "Aug 24, 2026",
    status: "accepted",
    message: "Hi Anatoli, we were impressed by your Next.js 15 and PostgreSQL background and would love to interview you!",
  },
  {
    id: "inv-2",
    candidateName: "Marek Kowalski",
    candidateRole: "Staff Frontend Engineer",
    jobTitle: "Frontend Architect (Design Systems)",
    companyName: "Stripe",
    sentDate: "Aug 23, 2026",
    status: "pending",
    message: "Hi Marek, we'd like to invite you for a discussion regarding our core Design Systems role.",
  },
  {
    id: "inv-3",
    candidateName: "Svetlana Petrova",
    candidateRole: "Senior Backend Developer",
    jobTitle: "Staff Backend Engineer (Postgres)",
    companyName: "Stripe",
    sentDate: "Aug 21, 2026",
    status: "pending",
    message: "Hi Svetlana, we saw your payment transaction experience and want to invite you to our team.",
  },
];

export default function RecruiterInvitesPage() {
  const [invites, setInvites] = React.useState<SentInvite[]>(initialSentInvites);
  const [search, setSearch] = React.useState("");

  const filtered = invites.filter((inv) =>
    inv.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    inv.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          Sent Invitations
          <Badge variant="purple" className="text-xs">
            {invites.length} Sent
          </Badge>
        </h1>
        <p className="text-xs text-slate-400">
          Track responses to direct interview invitations sent to opt-in candidates
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by candidate or job..."
          className="pl-8 text-xs bg-slate-900/60 border-slate-800"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((inv) => (
          <Card
            key={inv.id}
            className="border-slate-800/80 bg-slate-900/40 p-5 space-y-3 hover:border-purple-500/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-purple-500/30">
                  <AvatarFallback className="bg-purple-950 text-purple-300 font-bold text-xs">
                    {inv.candidateName.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-white">{inv.candidateName}</h3>
                  <p className="text-xs text-purple-300">{inv.candidateRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">For vacancy: <strong className="text-slate-200">{inv.jobTitle}</strong></span>
                {inv.status === "accepted" && (
                  <Badge variant="success" className="text-[10px] gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Accepted
                  </Badge>
                )}
                {inv.status === "pending" && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Clock className="h-3 w-3" />
                    Pending Response
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300 leading-relaxed font-sans">
              &quot;{inv.message}&quot;
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500">
              <span>Sent {inv.sentDate}</span>
              <span>{inv.status === "accepted" ? "Candidate accepted and card added to ATS" : "Waiting for candidate action"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
