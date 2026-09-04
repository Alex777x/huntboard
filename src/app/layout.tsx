import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { MobileNavProvider } from "@/components/providers/MobileNavProvider";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { InstallPromptBanner } from "@/components/pwa/InstallPromptBanner";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "HuntBoard — AI-First Job Search Management Platform",
  description:
    "Track your applications, optimize your CV with AI, analyze your ATS score, and find your dream job faster with HuntBoard.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HuntBoard",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-background text-foreground antialiased selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-200"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <QueryProvider>
              <PwaProvider>
                <MobileNavProvider>
                  <OfflineIndicator />
                  {children}
                  <InstallPromptBanner />
                </MobileNavProvider>
              </PwaProvider>
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
