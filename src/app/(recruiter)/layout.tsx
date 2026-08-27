import * as React from "react";
import { RecruiterSidebar } from "@/components/layout/RecruiterSidebar";
import { Header } from "@/components/layout/Header";

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-purple-500/30 selection:text-purple-200">
      {/* Sticky Recruiter Sidebar */}
      <RecruiterSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
