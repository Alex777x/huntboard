"use client";

import * as React from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  FolderGit2,
  Languages,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CVData, ExperienceItem, EducationItem, ProjectItem } from "@/types/cv";

interface CVFormEditorProps {
  cvData: CVData;
  onChange: (data: CVData) => void;
  onSave?: () => void;
}

export function CVFormEditor({ cvData, onChange, onSave }: CVFormEditorProps) {
  const [activeTab, setActiveTab] = React.useState<"personal" | "experience" | "skills" | "education" | "projects">("personal");
  const [skillInput, setSkillInput] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  const handleSaveClick = () => {
    onSave?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Personal info update
  const handlePersonalChange = (field: keyof CVData["personal"], value: string) => {
    onChange({
      ...cvData,
      personal: {
        ...cvData.personal,
        [field]: value,
      },
    });
  };

  // Add skill
  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (cvData.skills.includes(skillInput.trim())) return;

    onChange({
      ...cvData,
      skills: [...cvData.skills, skillInput.trim()],
    });
    setSkillInput("");
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    onChange({
      ...cvData,
      skills: cvData.skills.filter((s) => s !== skill),
    });
  };

  // Add Experience
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      role: "Software Engineer",
      location: "Remote",
      startDate: "2024-01",
      endDate: "Present",
      current: true,
      description: "• Led development of core features\n• Improved test coverage and reliability",
      technologies: ["React", "TypeScript"],
    };
    onChange({
      ...cvData,
      experience: [newExp, ...cvData.experience],
    });
  };

  // Update Experience
  const handleUpdateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange({
      ...cvData,
      experience: cvData.experience.map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
    });
  };

  // Delete Experience
  const handleDeleteExperience = (id: string) => {
    onChange({
      ...cvData,
      experience: cvData.experience.filter((exp) => exp.id !== id),
    });
  };

  // Add Education
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "University Name",
      degree: "B.Sc. in Computer Science",
      fieldOfStudy: "Software Engineering",
      startDate: "2018",
      endDate: "2022",
    };
    onChange({
      ...cvData,
      education: [...cvData.education, newEdu],
    });
  };

  // Update Education
  const handleUpdateEducation = (id: string, updates: Partial<EducationItem>) => {
    onChange({
      ...cvData,
      education: cvData.education.map((edu) =>
        edu.id === id ? { ...edu, ...updates } : edu
      ),
    });
  };

  // Delete Education
  const handleDeleteEducation = (id: string) => {
    onChange({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    });
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 p-5 space-y-5">
      {/* Editor Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: "personal", label: "Personal Info", icon: User },
            { id: "experience", label: "Experience", icon: Briefcase },
            { id: "skills", label: "Skills", icon: Sparkles },
            { id: "education", label: "Education", icon: GraduationCap },
            { id: "projects", label: "Projects", icon: FolderGit2 },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="h-8 px-2.5 text-xs gap-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        <Button
          onClick={handleSaveClick}
          size="sm"
          className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-sm"
        >
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          <span>{saved ? "Saved" : "Save CV"}</span>
        </Button>
      </div>

      {/* Tab: Personal Info */}
      {activeTab === "personal" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Full Name *
              </label>
              <Input
                value={cvData.personal.fullName}
                onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Target Role / Professional Title *
              </label>
              <Input
                value={cvData.personal.title}
                onChange={(e) => handlePersonalChange("title", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email</label>
              <Input
                type="email"
                value={cvData.personal.email}
                onChange={(e) => handlePersonalChange("email", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone</label>
              <Input
                value={cvData.personal.phone || ""}
                onChange={(e) => handlePersonalChange("phone", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Location</label>
              <Input
                value={cvData.personal.location || ""}
                onChange={(e) => handlePersonalChange("location", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">LinkedIn URL</label>
              <Input
                value={cvData.personal.linkedinUrl || ""}
                onChange={(e) => handlePersonalChange("linkedinUrl", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">GitHub / Portfolio URL</label>
              <Input
                value={cvData.personal.githubUrl || ""}
                onChange={(e) => handlePersonalChange("githubUrl", e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Professional Summary (2-3 sentences)
            </label>
            <textarea
              rows={4}
              value={cvData.personal.summary || ""}
              onChange={(e) => handlePersonalChange("summary", e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* Tab: Work Experience */}
      {activeTab === "experience" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Work History ({cvData.experience.length})
            </span>
            <Button
              onClick={handleAddExperience}
              size="sm"
              variant="outline"
              className="h-7 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Position</span>
            </Button>
          </div>

          <div className="space-y-4">
            {cvData.experience.map((exp, idx) => (
              <div
                key={exp.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <Input
                      placeholder="Company"
                      value={exp.company}
                      onChange={(e) =>
                        handleUpdateExperience(exp.id, { company: e.target.value })
                      }
                      className="bg-slate-900 border-slate-800 text-xs font-semibold"
                    />
                    <Input
                      placeholder="Job Title / Role"
                      value={exp.role}
                      onChange={(e) =>
                        handleUpdateExperience(exp.id, { role: e.target.value })
                      }
                      className="bg-slate-900 border-slate-800 text-xs"
                    />
                  </div>

                  <Button
                    onClick={() => handleDeleteExperience(exp.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Start Date (e.g. 2023-01)"
                    value={exp.startDate}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, { startDate: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                  <Input
                    placeholder="End Date (or Present)"
                    value={exp.endDate || ""}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, { endDate: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                  <Input
                    placeholder="Location (e.g. Warsaw / Remote)"
                    value={exp.location || ""}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, { location: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Achievements & Bullet Points (Use &quot;•&quot; for clean list)
                  </label>
                  <textarea
                    rows={4}
                    value={exp.description}
                    onChange={(e) =>
                      handleUpdateExperience(exp.id, { description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Skills */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Add Key Skill or Technology
            </label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder="e.g. Next.js 15, PostgreSQL, Docker (Press Enter)"
                className="bg-slate-950 border-slate-800 text-xs"
              />
              <Button
                onClick={handleAddSkill}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {cvData.skills.map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs py-1 px-3 bg-slate-950 border-slate-800 text-slate-200 hover:border-red-500/40 group cursor-pointer gap-1.5"
                onClick={() => handleRemoveSkill(skill)}
              >
                <span>{skill}</span>
                <span className="text-slate-500 group-hover:text-red-400">×</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Education */}
      {activeTab === "education" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Education History
            </span>
            <Button
              onClick={handleAddEducation}
              size="sm"
              variant="outline"
              className="h-7 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40 gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Education</span>
            </Button>
          </div>

          <div className="space-y-3">
            {cvData.education.map((edu) => (
              <div
                key={edu.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Institution (e.g. University)"
                    value={edu.institution}
                    onChange={(e) =>
                      handleUpdateEducation(edu.id, { institution: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs font-semibold max-w-sm"
                  />
                  <Button
                    onClick={() => handleDeleteEducation(edu.id)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Degree (e.g. B.Sc. in Computer Science)"
                    value={edu.degree}
                    onChange={(e) =>
                      handleUpdateEducation(edu.id, { degree: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                  <Input
                    placeholder="Start Year"
                    value={edu.startDate}
                    onChange={(e) =>
                      handleUpdateEducation(edu.id, { startDate: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                  <Input
                    placeholder="End Year"
                    value={edu.endDate || ""}
                    onChange={(e) =>
                      handleUpdateEducation(edu.id, { endDate: e.target.value })
                    }
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <span className="text-xs font-semibold text-slate-300">
            Featured Projects ({cvData.projects.length})
          </span>
          <div className="space-y-3">
            {cvData.projects.map((proj) => (
              <div key={proj.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Project Title"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = cvData.projects.map((p) =>
                        p.id === proj.id ? { ...p, title: e.target.value } : p
                      );
                      onChange({ ...cvData, projects: updated });
                    }}
                    className="bg-slate-900 border-slate-800 text-xs font-semibold"
                  />
                  <Input
                    placeholder="Project Link (https://...)"
                    value={proj.link || ""}
                    onChange={(e) => {
                      const updated = cvData.projects.map((p) =>
                        p.id === proj.id ? { ...p, link: e.target.value } : p
                      );
                      onChange({ ...cvData, projects: updated });
                    }}
                    className="bg-slate-900 border-slate-800 text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Project description and key outcomes..."
                  value={proj.description}
                  onChange={(e) => {
                    const updated = cvData.projects.map((p) =>
                      p.id === proj.id ? { ...p, description: e.target.value } : p
                    );
                    onChange({ ...cvData, projects: updated });
                  }}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
