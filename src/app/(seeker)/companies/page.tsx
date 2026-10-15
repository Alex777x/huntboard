"use client";

import * as React from "react";
import {
  Plus,
  Search,
  ExternalLink,
  MapPin,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CompanyDialog } from "@/components/companies/CompanyDialog";
import { Company } from "@/types/database";
import { safeHref, localeIncludes } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

export default function CompaniesPage() {
  const { t, locale } = useI18n();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from("companies")
          .select("*").limit(100)
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setCompanies(data as Company[]);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      }
    };
    fetchCompanies();
  }, []);
  const [search, setSearch] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return companies;
    return companies.filter(
      (c) =>
        localeIncludes(c.name, search, locale) ||
        localeIncludes(c.industry, search, locale) ||
        localeIncludes(c.notes, search, locale)
    );
  }, [companies, search, locale]);

  const handleSave = async (data: Partial<Company>) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const previousCompanies = companies;

    if (editingCompany) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === editingCompany.id ? ({ ...c, ...data } as Company) : c))
      );
      if (user) {
        const { error } = await supabase
          .from("companies")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", editingCompany.id);
        if (error) {
          console.error("Error updating company:", error);
          setCompanies(previousCompanies);
          setErrorMessage(error.message);
        }
      }
    } else {
      const profileId = user?.id || "00000000-0000-0000-0000-000000000001";
      const newCompPayload = {
        profile_id: profileId,
        name: data.name || "New Company",
        website: data.website || "",
        industry: data.industry || "",
        size: data.size || "100-500",
        location: data.location || "Remote",
        notes: data.notes || "",
        logo_url: null,
      };

      if (user) {
        const { data: inserted, error } = await supabase
          .from("companies")
          .insert(newCompPayload)
          .select()
          .single();

        if (error) {
          console.error("Error inserting company:", error);
          setErrorMessage(error.message);
          return;
        }

        if (inserted) {
          setCompanies([inserted as Company, ...companies]);
          return;
        }
      }

      const fallbackComp: Company = {
        ...newCompPayload,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCompanies([fallbackComp, ...companies]);
    }
  };

  const handleDelete = async (id: string) => {
    const previousCompanies = companies;
    setCompanies(companies.filter((c) => c.id !== id));
    setIsDialogOpen(false);
    const supabase = createClient();
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) {
      console.error("Error deleting company:", error);
      setCompanies(previousCompanies);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 dark:bg-red-950/40 p-4 text-xs font-semibold text-red-800 dark:text-red-300 flex items-center justify-between gap-3 animate-in fade-in-0 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.companies.title}
            <Badge variant="purple" className="text-xs">
              {companies.length} {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.companies.subtitle}
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
          <span>{t.companies.addCompany}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.companies.searchPlaceholder}
          className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
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
            className="cursor-pointer border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-3 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-all shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {c.name}
                    {c.website && (
                      <a
                        href={safeHref(c.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{c.industry}</span>
                </div>
              </div>

              <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {c.size}
              </Badge>
            </div>

            {c.notes && (
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 leading-relaxed">
                {c.notes}
              </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                <span>{c.location || "Remote"}</span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium">
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
