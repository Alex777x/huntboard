"use client";

import * as React from "react";
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact } from "@/types/database";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onSave: (contact: Partial<Contact>) => void;
  onDelete?: (id: string) => void;
}

export function ContactDialog({
  isOpen,
  onClose,
  contact,
  onSave,
  onDelete,
}: ContactDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Contact>>({
    name: "",
    role: "Technical Recruiter",
    company_id: "Stripe",
    email: "",
    phone: "",
    linkedin_url: "",
    notes: "",
  });

  React.useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      setFormData({
        name: "",
        role: "Technical Recruiter",
        company_id: "Stripe",
        email: "",
        phone: "",
        linkedin_url: "",
        notes: "",
      });
    }
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-400" />
            {contact ? "Edit Contact" : "Add Recruiter or Manager"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Full Name *</label>
              <Input
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Jessica Miller"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Company Name</label>
              <Input
                value={formData.company_id || ""}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                placeholder="e.g. Stripe, Vercel"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Role / Position</label>
            <Input
              value={formData.role || ""}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Senior Tech Recruiter, Engineering Manager"
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Email Address</label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">LinkedIn Profile URL</label>
              <Input
                type="url"
                value={formData.linkedin_url || ""}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Notes / Interview Context</label>
            <textarea
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Communication style, interview stage feedback, follow-up timeline..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            {contact && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onDelete(contact.id)}
                className="text-xs gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{contact ? "Save" : "Add Contact"}</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
