"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Users,
  Coins,
  Flag,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { title: "User Management", href: "/admin/users", icon: Users },
    { title: "Token Balances", href: "/admin/balance", icon: Coins },
    { title: "Feedback & Bugs", href: "/admin/feedback", icon: Flag },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 shadow-md shadow-purple-600/30">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">HuntBoard</div>
              <Badge variant="purple" className="text-[10px] py-0 px-1.5">
                Admin Console
              </Badge>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 font-medium transition-colors ${
                    isActive
                      ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <Link href="/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs border-slate-800 text-slate-300 gap-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to App</span>
            </Button>
          </Link>
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
            <span>Admin v1.0</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
