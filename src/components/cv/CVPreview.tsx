"use client";

import * as React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Printer,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CVData } from "@/types/cv";

interface CVPreviewProps {
  data: CVData;
}

export function CVPreview({ data }: CVPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Action Bar */}
      <div className="w-full max-w-[210mm] mb-4 flex items-center justify-between no-print">
        <div className="text-xs text-slate-400">
          Standard 1-Page ATS Template • Clean typography
        </div>
        <Button
          onClick={handlePrint}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / Save as PDF</span>
        </Button>
      </div>

      {/* Printable Sheet (A4 / US-Letter format) */}
      <div
        id="cv-printable-document"
        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 font-sans selection:bg-indigo-100 selection:text-indigo-900 print:p-0 print:shadow-none print:m-0 print:min-h-0 print:w-full"
      >
        {/* Header / Personal Info */}
        <header className="border-b-2 border-slate-900 pb-5 mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
            {data.personal.fullName}
          </h1>
          <p className="text-sm font-semibold text-indigo-700 mt-0.5 tracking-wide">
            {data.personal.title}
          </p>

          {/* Contact Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
            {data.personal.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-500" />
                <a href={`mailto:${data.personal.email}`} className="hover:underline">
                  {data.personal.email}
                </a>
              </span>
            )}
            {data.personal.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-500" />
                <span>{data.personal.phone}</span>
              </span>
            )}
            {data.personal.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-500" />
                <span>{data.personal.location}</span>
              </span>
            )}
            {data.personal.linkedinUrl && (
              <span className="flex items-center gap-1">
                <Linkedin className="h-3 w-3 text-slate-500" />
                <a href={data.personal.linkedinUrl} target="_blank" rel="noreferrer" className="hover:underline text-indigo-800">
                  LinkedIn
                </a>
              </span>
            )}
            {data.personal.githubUrl && (
              <span className="flex items-center gap-1">
                <Github className="h-3 w-3 text-slate-500" />
                <a href={data.personal.githubUrl} target="_blank" rel="noreferrer" className="hover:underline text-indigo-800">
                  GitHub
                </a>
              </span>
            )}
          </div>

          {/* Summary */}
          {data.personal.summary && (
            <p className="mt-3 text-xs text-slate-700 leading-relaxed text-justify">
              {data.personal.summary}
            </p>
          )}
        </header>

        {/* Section: Technical Skills */}
        {data.skills && data.skills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
              Technical Skills & Competencies
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-800">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded bg-slate-100 border border-slate-200/80 px-2 py-0.5 font-medium text-[11px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Section: Professional Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2.5">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex items-baseline justify-between font-bold text-slate-900">
                    <span className="text-sm text-slate-950">{exp.role}</span>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-medium text-[11px] mt-0.5">
                    <span className="text-indigo-800 font-semibold">{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>

                  <div className="mt-1.5 text-slate-700 whitespace-pre-line leading-relaxed text-[11px]">
                    {exp.description}
                  </div>

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600">Tech:</span>
                      {exp.technologies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Key Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
              Featured Projects
            </h2>
            <div className="space-y-2.5">
              {data.projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{proj.title}</span>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noreferrer" className="text-indigo-600 text-[10px] hover:underline flex items-center gap-0.5">
                        [Link]
                      </a>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-700 leading-relaxed">
                    {proj.description}
                  </p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-600">Stack:</span> {proj.technologies.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Education & Languages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                Education
              </h2>
              {data.education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <div className="font-bold text-slate-950">{edu.degree}</div>
                  <div className="text-slate-700 text-[11px]">{edu.institution}</div>
                  {edu.fieldOfStudy && (
                    <div className="text-slate-500 text-[10px]">{edu.fieldOfStudy}</div>
                  )}
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {edu.startDate} — {edu.endDate || "Present"}
                  </div>
                </div>
              ))}
            </section>
          )}

          {data.languages && data.languages.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                Languages
              </h2>
              <div className="space-y-1 text-xs">
                {data.languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="font-medium text-slate-800">{lang.language}</span>
                    <span className="text-slate-500">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
