"use client";

import * as React from "react";
import { Coins, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/components/providers/I18nProvider";
import { createClient } from "@/lib/supabase/client";

export default function AdminBalancePage() {
  const { t } = useI18n();
  const [users, setUsers] = React.useState<{ id: string; email: string; name: string; tokens: number }[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [tokensToAdd, setTokensToAdd] = React.useState("100");
  const [reason, setReason] = React.useState("Admin Bonus / Early Adopter Grant");
  const [successMessage, setSuccessMessage] = React.useState("");
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, company_email")
        .limit(200);
      const { data: balances } = await supabase
        .from("ai_token_balance")
        .select("profile_id, tokens_remaining")
        .limit(200);

      if (profiles) {
        const merged = profiles.map((p: any) => {
          const bal = balances?.find((b: any) => b.profile_id === p.id);
          return {
            id: p.id,
            email: p.email || p.company_email || "No email",
            name: p.full_name || "Unknown",
            tokens: bal ? bal.tokens_remaining : 0,
          };
        });
        setUsers(merged);
        if (merged.length > 0) setSelectedUserId(merged[0].id);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(tokensToAdd);
    if (!count || count <= 0 || !selectedUserId) return;

    const userObj = users.find((u) => u.id === selectedUserId);
    if (!userObj) return;

    const currentTokens = userObj.tokens;
    const prevUsers = users;
    setUsers(
      users.map((u) =>
        u.id === selectedUserId ? { ...u, tokens: u.tokens + count } : u
      )
    );

    const { data: newBalance, error: rpcError } = await supabase.rpc(
      "increment_token_balance",
      {
        p_profile_id: selectedUserId,
        p_amount: count,
      }
    );

    if (rpcError) {
      console.error("Failed to top up tokens via RPC:", rpcError);
      setUsers(prevUsers);
      return;
    }

    if (typeof newBalance === "number") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserId ? { ...u, tokens: newBalance } : u
        )
      );
    }

    setSuccessMessage(`Successfully granted +${count} tokens to ${userObj.email}!`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  if (loading) return <div>Loading...</div>;

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
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — {u.tokens} tokens
                </option>
              ))}
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
