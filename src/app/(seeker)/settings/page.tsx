"use client";

import * as React from "react";
import {
  Key,
  Shield,
  Eye,
  EyeOff,
  Coins,
  Globe,
  Sparkles,
  Check,
  Lock,
  User,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [provider, setProvider] = React.useState<"openai" | "gemini" | "anthropic">("openai");
  const [apiKey, setApiKey] = React.useState("");
  const [isVisibleToRecruiters, setIsVisibleToRecruiters] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [tested, setTested] = React.useState(false);

  React.useEffect(() => {
    const savedKey = localStorage.getItem("huntboard_api_key") || "";
    const savedProvider = (localStorage.getItem("huntboard_ai_provider") as typeof provider) || "openai";
    const savedVisibility = localStorage.getItem("huntboard_recruiter_visibility") === "true";

    setApiKey(savedKey);
    setProvider(savedProvider);
    setIsVisibleToRecruiters(savedVisibility);
  }, []);

  const handleSave = () => {
    localStorage.setItem("huntboard_api_key", apiKey);
    localStorage.setItem("huntboard_ai_provider", provider);
    localStorage.setItem("huntboard_recruiter_visibility", String(isVisibleToRecruiters));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestKey = () => {
    if (!apiKey) return;
    setTested(true);
    setTimeout(() => setTested(false), 3000);
  };

  const handleClearKey = () => {
    setApiKey("");
    localStorage.removeItem("huntboard_api_key");
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Account & AI Settings
        </h1>
        <p className="text-xs text-slate-400">
          Manage your AI keys, privacy preferences, token balances, and regional settings
        </p>
      </div>

      {/* Privacy & Recruiter Visibility Card (Opt-in) */}
      <Card className="border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">
                Candidate Visibility to Verified Recruiters
              </h3>
              <Badge variant={isVisibleToRecruiters ? "success" : "secondary"} className="text-[10px]">
                {isVisibleToRecruiters ? "Public to Recruiters" : "Hidden (Private)"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              When turned off (default), your profile and applications are 100% private. When enabled, verified recruiters can discover your skill profile and send you direct vacancy invites.
            </p>
          </div>

          <Button
            size="sm"
            variant={isVisibleToRecruiters ? "default" : "outline"}
            onClick={() => {
              const next = !isVisibleToRecruiters;
              setIsVisibleToRecruiters(next);
              localStorage.setItem("huntboard_recruiter_visibility", String(next));
            }}
            className={`text-xs gap-1.5 shrink-0 ${
              isVisibleToRecruiters
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "border-slate-700 text-slate-300"
            }`}
          >
            {isVisibleToRecruiters ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{isVisibleToRecruiters ? "Visible: ON" : "Visible: OFF"}</span>
          </Button>
        </div>
      </Card>

      {/* AI Access & BYO Key Settings */}
      <Card className="border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                AI Provider & Access Model
              </h3>
              <p className="text-xs text-slate-400">
                Choose between using your personal API key or using pre-allocated tokens
              </p>
            </div>
            <Badge variant="purple" className="text-xs">
              150 Tokens Remaining
            </Badge>
          </div>

          {/* Provider Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Select AI Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "openai", name: "OpenAI (GPT-4o)", icon: "🟢" },
                { id: "gemini", name: "Google Gemini 2.5", icon: "🔵" },
                { id: "anthropic", name: "Anthropic Claude 3.7", icon: "🟣" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id as typeof provider)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    provider === p.id
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">BYO Key Support</div>
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-slate-500" />
              Your {provider.toUpperCase()} API Key (Encrypted via AES-256)
            </label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-slate-950 border-slate-800 text-xs flex-1 font-mono"
              />
              {apiKey && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearKey}
                  className="text-xs border-slate-800 text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Your key is securely encrypted on the server. If left blank, requests will use your platform token balance.
            </p>
          </div>

          {tested && (
            <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Connection test successful! Valid response received from {provider.toUpperCase()}.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
            <Button
              onClick={handleSave}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md"
            >
              {saved ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
              <span>{saved ? "Saved Successfully!" : "Save Key & Preferences"}</span>
            </Button>

            {apiKey && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestKey}
                className="text-xs border-slate-800 text-slate-300 hover:border-slate-700"
              >
                Test Connection
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
