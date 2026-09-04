"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Search,
  Mail,
  Linkedin,
  Building2,
  Phone,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactDialog } from "@/components/contacts/ContactDialog";
import { Contact } from "@/types/database";
import { safeHref } from "@/lib/utils";
import { useI18n } from "@/components/providers/I18nProvider";

const initialContacts: Contact[] = [
  {
    id: "cont-1",
    profile_id: "user-1",
    name: "Jessica Miller",
    role: "Senior Tech Recruiter",
    company_id: "Stripe",
    email: "jmiller@stripe.com",
    phone: "+1 (415) 555-0199",
    linkedin_url: "https://linkedin.com/in/example",
    notes: "Initial phone screen contact. Very responsive to follow-up emails.",
    created_at: "2026-08-20T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: "cont-2",
    profile_id: "user-1",
    name: "David Chen",
    role: "Engineering Manager (Next.js Team)",
    company_id: "Vercel",
    email: "dchen@vercel.com",
    phone: null,
    linkedin_url: "https://linkedin.com/in/example",
    notes: "Interviewer for System Design stage. Focuses on SSR caching & Edge Runtime.",
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-22T10:00:00Z",
  },
  {
    id: "cont-3",
    profile_id: "user-1",
    name: "Karolina Wisniewska",
    role: "Talent Acquisition Partner",
    company_id: "Spotify",
    email: "kwisniewska@spotify.com",
    phone: null,
    linkedin_url: "https://linkedin.com/in/example",
    notes: "Coordinates technical panels and interview scheduling.",
    created_at: "2026-08-18T10:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  },
];

export default function ContactsPage() {
  const { t } = useI18n();
  const [contacts, setContacts] = React.useState<Contact[]>(initialContacts);
  const [search, setSearch] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);

  const filtered = React.useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company_id && c.company_id.toLowerCase().includes(q)) ||
        (c.role && c.role.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [contacts, search]);

  const handleSave = (data: Partial<Contact>) => {
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? ({ ...c, ...data } as Contact) : c))
      );
    } else {
      const newContact: Contact = {
        id: `cont-${crypto.randomUUID()}`,
        profile_id: "user-1",
        name: data.name || "New Contact",
        role: data.role || "Recruiter",
        company_id: data.company_id || null,
        email: data.email || null,
        phone: data.phone || null,
        linkedin_url: data.linkedin_url || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setContacts([newContact, ...contacts]);
    }
  };

  const handleDelete = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.contacts.title}
            <Badge variant="purple" className="text-xs">
              {contacts.length} {t.common.active}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.contacts.subtitle}
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingContact(null);
            setIsDialogOpen(true);
          }}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>{t.contacts.addContact}</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.contacts.searchPlaceholder}
          className="pl-8 text-xs bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <Card
            key={c.id}
            onClick={() => {
              setEditingContact(c);
              setIsDialogOpen(true);
            }}
            className="cursor-pointer border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-4 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-all shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{c.role}</p>
                </div>
              </div>

              {c.company_id && (
                <Badge variant="outline" className="text-[10px] border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-300">
                  {c.company_id}
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {c.email && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                  <a
                    href={safeHref(`mailto:${c.email}`)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                  >
                    {c.email}
                  </a>
                </div>
              )}
              {c.linkedin_url && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Linkedin className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400" />
                  <a
                    href={safeHref(c.linkedin_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>

            {c.notes && (
              <p className="text-xs text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60 leading-relaxed">
                {c.notes}
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 text-right">
              <span className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-medium">
                Click to edit contact →
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <ContactDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        contact={editingContact}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
