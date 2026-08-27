"use client";

import * as React from "react";
import Link from "next/link";
import {
  Inbox,
  Building,
  Briefcase,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  ArrowRight,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";

interface SeekerInvite {
  id: string;
  recruiterName: string;
  companyName: string;
  isVerifiedCompany: boolean;
  jobTitle: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  message: string;
  date: string;
  status: "pending" | "accepted" | "declined";
}

const initialSeekerInvites: SeekerInvite[] = [
  {
    id: "inv-101",
    recruiterName: "Jessica Miller (Senior Tech Recruiter)",
    companyName: "Stripe",
    isVerifiedCompany: true,
    jobTitle: "Senior Fullstack Engineer (Payments)",
    location: "Remote (EU / US)",
    salaryMin: 150000,
    salaryMax: 185000,
    message:
      "Hi Anatoli! We noticed your profile and open-to-relocation status on HuntBoard. Your expertise in Next.js 15, TypeScript, and distributed Postgres is a great match for our Billing team. Would you be open to an initial technical screen this week?",
    date: "Aug 25, 2026",
    status: "pending",
  },
  {
    id: "inv-102",
    recruiterName: "David Chen (Engineering Manager)",
    companyName: "Vercel",
    isVerifiedCompany: true,
    jobTitle: "Frontend Systems Engineer",
    location: "Remote",
    salaryMin: 160000,
    salaryMax: 190000,
    message:
      "Hello Anatoli, our App Router core team is expanding. We saw your CV ATS profile and would love to invite you for a conversation with the team.",
    date: "Aug 22, 2026",
    status: "accepted",
  },
];

export default function SeekerInvitesPage() {
  const { t } = useI18n();
  const [invites, setInvites] = React.useState<SeekerInvite[]>(initialSeekerInvites);
  const [toastMessage, setToastMessage] = React.useState("");

  const handleAccept = (invite: SeekerInvite) => {
    setInvites((prev) =>
      prev.map((i) => (i.id === invite.id ? { ...i, status: "accepted" } : i))
    );
    setToastMessage(
      `🎉 Invitation accepted! An application card for "${invite.jobTitle}" at ${invite.companyName} has been added to your Kanban pipeline.`
    );
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleDecline = (id: string) => {
    setInvites((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "declined" } : i))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.invites.title}
          <Badge variant="purple" className="text-xs">
            {invites.filter((i) => i.status === "pending").length} {t.invites.pendingReview}
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.invites.subtitle}
        </p>
      </div>

      {/* Success Banner */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in-0 shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <Link href="/applications">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1">
              <span>{t.invites.viewKanban}</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Invites List */}
      <div className="space-y-4">
        {invites.map((invite) => (
          <Card
            key={invite.id}
            className={`border p-6 space-y-4 transition-all shadow-sm ${
              invite.status === "pending"
                ? "border-purple-500/40 bg-white dark:bg-slate-900/80 shadow-md shadow-purple-500/5"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40"
            }`}
          >
            {/* Top Bar: Company & Role */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{invite.companyName}</span>
                  {invite.isVerifiedCompany && (
                    <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
                      <ShieldCheck className="h-3 w-3" />
                      {t.community.verifiedEmployer}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-500">• {invite.date}</span>
                </div>
                <h3 className="text-base font-bold text-purple-700 dark:text-purple-300">
                  {invite.jobTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {invite.location}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    ${(invite.salaryMin / 1000).toFixed(0)}k - ${(invite.salaryMax / 1000).toFixed(0)}k USD
                  </span>
                </div>
              </div>

              {/* Status or Actions */}
              <div className="flex items-center gap-2">
                {invite.status === "pending" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecline(invite.id)}
                      className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      {t.invites.decline}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAccept(invite)}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-purple-600/25"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{t.invites.acceptAndAddToKanban}</span>
                    </Button>
                  </>
                ) : invite.status === "accepted" ? (
                  <Badge variant="success" className="text-xs gap-1 py-1 px-3">
                    <Check className="h-3.5 w-3.5" />
                    {t.invites.acceptedAndTracked}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs py-1 px-3">
                    {t.invites.declined}
                  </Badge>
                )}
              </div>
            </div>

            {/* Recruiter Message */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 p-3.5 space-y-1 text-xs text-slate-800 dark:text-slate-300 leading-relaxed font-sans">
              <div className="text-[10px] font-semibold uppercase text-purple-600 dark:text-purple-400">
                {t.invites.messageFrom} {invite.recruiterName}:
              </div>
              <p>&quot;{invite.message}&quot;</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
