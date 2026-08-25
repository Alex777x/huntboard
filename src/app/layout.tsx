import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HuntBoard — AI-First Job Search Management Platform",
  description:
    "Track your applications, optimize your CV with AI, analyze your ATS score, and find your dream job faster with HuntBoard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <QueryProvider>{children}</QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
