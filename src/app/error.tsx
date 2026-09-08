"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("HuntBoard Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 shadow-inner text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            An unexpected error occurred while rendering this page. You can try refreshing or returning to the dashboard.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-1">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            size="sm"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
