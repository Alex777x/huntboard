"use client";

import * as React from "react";
import { Printer, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CVData } from "@/types/cv";
import { safeHref } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const { t } = useI18n();
  const documentRef = React.useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = React.useState(1);
  const [contentHeight, setContentHeight] = React.useState(0);

  // A4 printable height at 96 DPI is ~1122px (297mm). With padding, content area is ~1040px
  const A4_PAGE_HEIGHT_PX = 1040;

  React.useEffect(() => {
    const el = documentRef.current;
    if (!el) return;

    const measurePages = () => {
      const scrollH = el.scrollHeight;
      setContentHeight(scrollH);
      const calculatedPages = Math.max(1, Math.ceil((scrollH - 20) / A4_PAGE_HEIGHT_PX));
      setPageCount(calculatedPages);
    };

    measurePages();

    const observer = new ResizeObserver(measurePages);
    observer.observe(el);

    return () => observer.disconnect();
  }, [data]);

  const handlePrint = () => {
    const originalTitle = document.title;
    const namePart = (data.personal.fullName || "Candidate").trim();
    const titlePart = (data.personal.title || "Resume").trim();

    // Clean, standard recruiter-friendly file name: "CV - Anatoli Aliaksandrou - Java Software Engineer"
    const exportFileName = `CV - ${namePart} - ${titlePart}`.replace(/[/\\?%*:|"<>]/g, "");
    document.title = exportFileName;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const cleanGithubDisplay = (url?: string) => {
    if (!url) return "";
    return url.replace(/^https?:\/\/(www\.)?github\.com\//i, "github.com/");
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Action Bar with Dynamic Page Indicator & Single Export Button */}
      <div className="w-full max-w-[210mm] mb-3.5 flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2">
          {pageCount === 1 ? (
            <Badge
              variant="success"
              className="text-xs gap-1.5 py-1 px-2.5 shadow-xs font-semibold"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.cv.pageCountBadge1}</span>
            </Badge>
          ) : (
            <Badge
              variant="warning"
              className="text-xs gap-1.5 py-1 px-2.5 shadow-xs font-semibold animate-pulse"
            >
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.cv.pageCountBadge2}</span>
            </Badge>
          )}

          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {t.cv.singleColumnBadge}
          </span>
        </div>

        <Button
          onClick={handlePrint}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm h-8"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>{t.cv.printBtn}</span>
        </Button>
      </div>

      {/* Printable ATS Document Sheet (A4 / US-Letter Format) */}
      <div
        ref={documentRef}
        id="cv-printable-document"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-950 shadow-2xl rounded-sm p-7 sm:p-9 font-serif selection:bg-slate-200 selection:text-slate-900 print:p-0 print:shadow-none print:m-0 print:min-h-0 print:w-full print:text-black leading-snug relative"
        style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }}
      >
        {/* Visual Page Break Marker for Multi-page Warning in Preview */}
        {pageCount > 1 && (
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-400/80 pointer-events-none no-print flex items-center justify-center"
            style={{ top: `${A4_PAGE_HEIGHT_PX}px` }}
          >
            <span className="bg-red-100 text-red-700 text-[10px] font-sans font-bold px-3 py-0.5 rounded-full shadow-xs -translate-y-1/2">
              {t.cv.page2Marker}
            </span>
          </div>
        )}

        {/* Candidate Header */}
        <div className="text-center pb-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 print:text-black uppercase">
            {data.personal.fullName}
          </h1>
          {data.personal.title && (
            <div className="text-sm font-semibold text-slate-900 print:text-black mt-0.5">
              {data.personal.title}
            </div>
          )}

          {/* Contact Bar with middle dots */}
          <div className="mt-1 text-[11px] print:text-[9.5pt] text-slate-800 print:text-black flex flex-wrap items-center justify-center gap-x-1.5 leading-tight">
            {data.personal.location && <span>{data.personal.location}</span>}
            {data.personal.phone && (
              <>
                <span className="text-slate-500 font-bold">·</span>
                <span>{data.personal.phone}</span>
              </>
            )}
            {data.personal.email && (
              <>
                <span className="text-slate-500 font-bold">·</span>
                <a
                  href={safeHref(`mailto:${data.personal.email}`)}
                  className="hover:underline text-slate-950 print:text-black"
                >
                  {data.personal.email}
                </a>
              </>
            )}
            {data.personal.linkedinUrl && (
              <>
                <span className="text-slate-500 font-bold">·</span>
                <a
                  href={safeHref(data.personal.linkedinUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-slate-950 print:text-black"
                >
                  {data.personal.linkedinUrl}
                </a>
              </>
            )}
            {data.personal.githubUrl && (
              <>
                <span className="text-slate-500 font-bold">·</span>
                <a
                  href={safeHref(data.personal.githubUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-slate-950 print:text-black"
                >
                  {cleanGithubDisplay(data.personal.githubUrl)}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Divider Line */}
        <hr className="border-t border-slate-900 print:border-black mb-2 mt-1" />

        {/* SUMMARY */}
        {data.personal.summary && (
          <section className="mb-2.5">
            <h2 className="text-xs print:text-[10pt] font-bold uppercase tracking-wider text-slate-950 print:text-black mb-0.5">
              SUMMARY
            </h2>
            <p className="text-[11px] print:text-[9.5pt] text-slate-900 print:text-black leading-tight text-justify">
              {data.personal.summary}
            </p>
          </section>
        )}

        {/* PROFESSIONAL EXPERIENCE */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-2.5">
            <h2 className="text-xs print:text-[10pt] font-bold uppercase tracking-wider text-slate-950 print:text-black mb-1.5">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-2.5">
              {data.experience.map((exp) => (
                <div key={exp.id} className="text-[11px] print:text-[9.5pt]">
                  {/* Row 1: Role & Date */}
                  <div className="flex items-baseline justify-between font-bold text-slate-950 print:text-black">
                    <span>{exp.role}</span>
                    <span className="text-right whitespace-nowrap">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {/* Row 2: Company & Location */}
                  <div className="font-bold text-slate-900 print:text-black">
                    {exp.company}{exp.location ? `, ${exp.location}` : ""}
                  </div>

                  {/* Row 3: Company Description */}
                  {exp.companyDescription && (
                    <div className="text-[10px] print:text-[8.5pt] text-slate-700 print:text-slate-800 leading-tight italic mt-0.5">
                      {exp.companyDescription}
                    </div>
                  )}

                  {/* Nested Projects with Clear Indentation */}
                  {exp.projects && exp.projects.length > 0 ? (
                    <div className="mt-1 ml-3.5 space-y-1 border-l border-slate-200 print:border-transparent pl-2.5">
                      {exp.projects.map((proj, pIdx) => (
                        <div key={pIdx} className="text-[11px] print:text-[9.5pt]">
                          {proj.name && (
                            <div className="font-semibold text-slate-950 print:text-black">
                              {proj.name}
                              {proj.description && (
                                <span className="font-normal text-slate-800 print:text-black"> {proj.description}</span>
                              )}
                            </div>
                          )}
                          {proj.highlights && proj.highlights.filter((h) => h.trim().length > 0).length > 0 && (
                            <ul className="list-disc ml-4 space-y-0.5 mt-0.5 text-[10.5px] print:text-[9pt] text-slate-900 print:text-black leading-tight">
                              {proj.highlights
                                .filter((bullet) => bullet.trim().length > 0)
                                .map((bullet, bIdx) => (
                                  <li key={bIdx}>{bullet.replace(/^[•\-\*]\s*/, "")}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : exp.description ? (
                    <div className="mt-1 ml-3 whitespace-pre-line text-[10.5px] print:text-[9pt] text-slate-900 print:text-black leading-tight">
                      {exp.description}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LANGUAGES */}
        {data.languages && data.languages.length > 0 && (
          <section className="mb-2">
            <h2 className="text-xs print:text-[10pt] font-bold uppercase tracking-wider text-slate-950 print:text-black mb-0.5">
              LANGUAGES
            </h2>
            <p className="text-[11px] print:text-[9.5pt] text-slate-900 print:text-black leading-tight">
              {data.languages
                .map((lang) => `${lang.language}: ${lang.proficiency}`)
                .join(", ")}
              .
            </p>
          </section>
        )}

        {/* EDUCATION */}
        {data.education && data.education.length > 0 && (
          <section className="mb-2">
            <h2 className="text-xs print:text-[10pt] font-bold uppercase tracking-wider text-slate-950 print:text-black mb-0.5">
              EDUCATION
            </h2>
            <ul className="list-disc ml-4 space-y-0.5 text-[10.5px] print:text-[9.5pt] text-slate-900 print:text-black leading-tight">
              {data.education.map((edu) => (
                <li key={edu.id}>
                  <span className="font-medium">{edu.institution}</span>
                  {edu.degree ? `, ${edu.degree}` : ""}
                  {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
                  {edu.details ? ` (${edu.details})` : ""}
                  {edu.startDate || edu.endDate ? ` (${[edu.startDate, edu.endDate].filter(Boolean).join(" - ")})` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* SKILLS */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-1.5">
            <h2 className="text-xs print:text-[10pt] font-bold uppercase tracking-wider text-slate-950 print:text-black mb-0.5">
              SKILLS
            </h2>
            <p className="text-[10.5px] print:text-[9pt] text-slate-900 print:text-black leading-tight text-justify">
              {data.skills.join(", ")}.
            </p>
          </section>
        )}

        {/* GDPR / RODO Consent Clause */}
        {data.gdprConsent?.enabled && data.gdprConsent.text && (
          <footer className="mt-2.5 pt-1.5 border-t border-slate-400 print:border-black text-center">
            <p className="text-[8px] print:text-[7.5pt] italic text-slate-600 print:text-black leading-tight text-center">
              {data.gdprConsent.text}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
