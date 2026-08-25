"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Users2,
  GitBranch,
  ShieldCheck,
  Send,
  Building,
  ArrowLeftRight,
  Globe,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "purple" | "emerald";
}

const recruiterNavItems: NavItem[] = [
  {
    title: "Job Vacancies",
    href: "/recruiter/jobs",
    icon: Briefcase,
    badge: "4 Active",
    badgeVariant: "purple",
  },
  {
    title: "Talent Pool",
    href: "/recruiter/talent",
    icon: Users2,
    badge: "Opt-in",
    badgeVariant: "emerald",
  },
  {
    title: "Sent Invitations",
    href: "/recruiter/invites",
    icon: Send,
  },
  {
    title: "Community Board",
    href: "/community",
    icon: Globe,
  },
  {
    title: "Company Verification",
    href: "/recruiter/verify",
    icon: ShieldCheck,
    badge: "Verified",
    badgeVariant: "emerald",
  },
];

export function RecruiterSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950/95 text-slate-200 backdrop-blur-xl",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
            <Building className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">HuntBoard</span>
              <Badge variant="purple" className="text-[9px] px-1 py-0 font-bold">
                RECRUITER
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400">Employer Portal</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Hiring Pipeline
          </div>
          <nav className="space-y-1">
            {recruiterNavItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/recruiter/jobs" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isActive ? "text-purple-400" : "text-slate-400 group-hover:text-slate-200"
                      )}
                    />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.2 text-[10px] font-bold",
                        item.badgeVariant === "emerald"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-purple-500/20 text-purple-300"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Company Card */}
        <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-slate-900/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Stripe Recruiting</span>
            <Badge variant="success" className="text-[9px] gap-1 px-1.5 py-0">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400">
            Domain <span className="text-slate-300">@stripe.com</span> verified. Unlimited talent search active.
          </p>
        </div>
      </div>

      {/* Switch to Seeker Mode Footer */}
      <div className="border-t border-slate-800/80 p-3 space-y-2">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between text-xs border-slate-800 text-slate-300 hover:border-indigo-500/40 bg-slate-900/60"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-400" />
              Switch to Seeker Portal
            </span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
