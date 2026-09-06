"use client";

import * as React from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  MoreHorizontal,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useI18n } from "@/components/providers/I18nProvider";
import { localeIncludes } from "@/lib/utils";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "seeker" | "recruiter" | "admin";
  isVerified: boolean;
  tokens: number;
  joinedDate: string;
}

const demoUsers: UserRecord[] = [
  {
    id: "u-1",
    name: "Anatoli Liaksandrou",
    email: "anatoli@example.com",
    role: "seeker",
    isVerified: false,
    tokens: 150,
    joinedDate: "Aug 20, 2026",
  },
  {
    id: "u-2",
    name: "Sarah Chen",
    email: "sarah@supabase.com",
    role: "recruiter",
    isVerified: true,
    tokens: 500,
    joinedDate: "Aug 15, 2026",
  },
  {
    id: "u-3",
    name: "Elena Rostova",
    email: "elena@anthropic.com",
    role: "recruiter",
    isVerified: true,
    tokens: 300,
    joinedDate: "Aug 18, 2026",
  },
  {
    id: "u-4",
    name: "Platform Admin",
    email: "admin@huntboard.io",
    role: "admin",
    isVerified: true,
    tokens: 9999,
    joinedDate: "Aug 1, 2026",
  },
];

export default function AdminUsersPage() {
  const { t, locale } = useI18n();
  const [users, setUsers] = React.useState<UserRecord[]>(demoUsers);
  const [search, setSearch] = React.useState("");

  const filtered = users.filter(
    (u) =>
      localeIncludes(u.name, search, locale) ||
      localeIncludes(u.email, search, locale)
  );

  const toggleVerification = (id: string) => {
    setUsers(
      users.map((u) => (u.id === id ? { ...u, isVerified: !u.isVerified } : u))
    );
  };

  const changeRole = (id: string, newRole: UserRecord["role"]) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          {t.admin.usersTitle}
          <Badge variant="purple" className="text-xs">
            {users.length} {t.common.active}
          </Badge>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.admin.usersSubtitle}
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user name or email..."
          className="pl-8 text-xs bg-slate-900/60 border-slate-800"
        />
      </div>

      {/* Users Table */}
      <Card className="border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">User</th>
                <th className="p-3.5">System Role</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5">AI Token Balance</th>
                <th className="p-3.5">Joined</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-700">
                        <AvatarFallback className="bg-slate-800 text-xs font-bold text-slate-200">
                          {user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        changeRole(user.id, e.target.value as UserRecord["role"])
                      }
                      className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 capitalize"
                    >
                      <option value="seeker">Job Seeker</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-3.5">
                    {user.isVerified ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Unverified
                      </Badge>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-purple-300">
                      {user.tokens} tokens
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{user.joinedDate}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVerification(user.id)}
                      className="h-7 text-xs text-purple-400 hover:text-white"
                    >
                      {user.isVerified ? "Revoke Badge" : "Verify Account"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
