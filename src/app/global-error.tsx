"use client";

import * as React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("HuntBoard Global Fatal Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-400">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold">System Error</h1>
            <p className="text-xs text-slate-400">
              A critical layout error occurred. Please try reloading the application.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
