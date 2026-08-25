"use client";

import * as React from "react";
import {
  Building2,
  Plus,
  Search,
  ExternalLink,
  MapPin,
  Users,
  MoreHorizontal,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { Company } from "@/types/database";

const initialCompanies: Company[] = [
  {
    id: "comp-1",
    profile_id: "user-1",
    name: "Stripe",
    website: "https://stripe.com",
    industry: "Fintech & Payments",
    size: "Enterprise (7,000+)",
    location: "San Francisco / Remote",
    notes: "Engineering culture focuses on high API reliability and written communication.",
    logo_url: null,
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "comp-2",
    profile_id: "user-1",
    name: "Vercel",
    website: "https://vercel.com",
    industry: "Developer Tools & Cloud",
    size: "Mid-size (500+)",
    location: "Remote (Global)",
    notes: "Creators of Next.js and Turbopack. Fast interview turnaround.",
    logo_url: null,
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "comp-3",
    profile_id: "user-1",
    name: "Linear",
    website: "https://linear.app",
    industry: "Productivity Software",
    size: "Startup (80+)",
    location: "Remote",
    notes: "Heavy emphasis on product craft, UI responsiveness, and sync engines.",
    logo_url: null,
    created_at: "2026-08-15T10:00:00Z",
    updated_at: "2026-08-15T10:00:00Z",
  },
  {
    id: "comp-4",
    profile_id: "user-1",
    name: "Spotify",
    website: "https://spotify.com",
    industry: "Audio Streaming",
    size: "Enterprise (9,000+)",
    location: "Stockholm / Hybrid",
    notes: "Platform engineering teams use microfrontends and internal developer portals.",
    logo_url: null,
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  },
];

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>(initialCompanies);
  const [search, setSearch] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [companies, search]);

  const handleSave = (data: Partial<Company>) => {
    if (editingCompany) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === editingCompany.id ? ({ ...c, ...data } as Company) : c))
      );
    } else {
      const newComp: Company = {
        id: `comp-${Date.now()}`,
        profile_id: "user-1",
        name: data.name || "New Company",
        website: data.website || null,
        industry: data.industry || null,
        size: data.size || "Mid-size (100-1,000)",
        location: data.location || "Remote",
        notes: data.notes || null,
        logo_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCompanies([newComp, ...companies]);
    }
  };

  const handleDelete = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id));
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Companies Directory
            <Badge variant="purple" className="text-xs">
              {companies.length} Tracked
            </Badge>
          </h1>
          <p className="text-xs text-slate-400">
            Keep notes, culture reviews, and recruiter contacts organized per company
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingCompany(null);
            setIsDialogOpen(true);
          }}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>Add Company</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter companies by name, industry, notes..."
          className="pl-8 text-xs bg-slate-900/60 border-slate-800"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <Card
            key={c.id}
            onClick={() => {
              setEditingCompany(c);
              setIsDialogOpen(true);
            }}
            className="cursor-pointer border-slate-800/80 bg-slate-900/40 p-5 space-y-3 hover:border-indigo-500/40 hover:bg-slate-900/70 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    {c.name}
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-500 hover:text-indigo-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </h3>
                  <span className="text-xs text-slate-400">{c.industry}</span>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
                {c.size}
              </Badge>
            </div>

            {c.notes && (
              <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                {c.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{c.location || "Remote"}</span>
              </div>
              <span className="text-indigo-400 hover:underline text-[11px] font-medium">
                Click to edit details →
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <CompanyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        company={editingCompany}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
