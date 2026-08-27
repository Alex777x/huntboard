"use client";

import * as React from "react";
import { Coins, Plus, Sparkles, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";

export default function AdminBalancePage() {
  const { t } = useI18n();
  const [selectedUser, setSelectedUser] = React.useState("anatoli@example.com");
  const [tokensToAdd, setTokensToAdd] = React.useState("100");
  const [reason, setReason] = React.useState("Admin Bonus / Early Adopter Grant");
  const [successMessage, setSuccessMessage] = React.useState("");

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(tokensToAdd);
    if (!count || count <= 0) return;

    setSuccessMessage(`Successfully granted +${count} tokens to ${selectedUser}!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.admin.balanceTitle}
          <Badge variant="purple" className="text-xs">
            Admin Quota Tool
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.admin.balanceSubtitle}
        </p>
      </div>

      {successMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <Card className="border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <form onSubmit={handleTopup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Select User Email *
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="anatoli@example.com">Anatoli Liaksandrou (anatoli@example.com) — 150 tokens</option>
              <option value="sarah@supabase.com">Sarah Chen (sarah@supabase.com) — 500 tokens</option>
              <option value="elena@anthropic.com">Elena Rostova (elena@anthropic.com) — 300 tokens</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Tokens Amount to Add *
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                required
                value={tokensToAdd}
                onChange={(e) => setTokensToAdd(e.target.value)}
                placeholder="e.g. 100"
                className="bg-slate-950 border-slate-800 text-xs"
              />
              <div className="flex gap-1.5">
                {[50, 100, 250, 500].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTokensToAdd(amount.toString())}
                    className="h-9 px-2.5 text-xs border-slate-800 text-slate-300 hover:border-purple-500/40"
                  >
                    +{amount}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Reason / Transaction Note
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bank wire confirmation #91823"
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold gap-2 shadow-lg shadow-purple-600/25"
          >
            <Coins className="h-4 w-4" />
            <span>Grant Tokens to User</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}
