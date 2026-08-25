"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe,
  ArrowBigUp,
  ArrowBigDown,
  Sparkles,
  ExternalLink,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Bookmark,
  Check,
  Flag,
  Share2,
  MapPin,
  Building,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NewPostDialog, CommunityJobPost } from "@/components/community/NewPostDialog";
import { ReportDialog } from "@/components/community/ReportDialog";
import { useI18n } from "@/components/providers/I18nProvider";

const initialCommunityPosts: CommunityJobPost[] = [
  {
    id: "post-1",
    authorName: "Jessica Miller (Stripe Recruiter)",
    companyName: "Stripe",
    jobTitle: "Senior Fullstack Engineer (Billing & Payments)",
    jobUrl: "https://stripe.com/jobs",
    workFormat: "remote",
    location: "Remote (EU / US Timezones)",
    description:
      "We're hiring a Senior Fullstack Engineer to lead our billing UI and ledger microservices. Great culture, deep written asynchronous work, and top-tier compensation ($150k-$185k).",
    tags: ["Next.js 15", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    upvotes: 42,
    downvotes: 1,
    userVote: null,
    isVerifiedRecruiter: true,
    postedDate: "2 hours ago",
  },
  {
    id: "post-2",
    authorName: "Alexandre Dev",
    companyName: "Linear",
    jobTitle: "Product Engineer (Sync Engine & Web)",
    jobUrl: "https://linear.app/careers",
    workFormat: "remote",
    location: "Remote (Worldwide)",
    description:
      "Linear is looking for product engineers who obsess over 60fps UI responsiveness, local-first SQLite sync, and high craftsmanship.",
    tags: ["React 19", "TypeScript", "Local-first", "Tailwind"],
    upvotes: 68,
    downvotes: 0,
    userVote: "up",
    isVerifiedRecruiter: false,
    postedDate: "5 hours ago",
  },
  {
    id: "post-3",
    authorName: "Sarah Chen (Supabase Talent)",
    companyName: "Supabase",
    jobTitle: "Database Platform Engineer",
    jobUrl: "https://supabase.com/careers",
    workFormat: "remote",
    location: "Remote",
    description:
      "Work on open-source PostgreSQL extensions, realtime replication, and edge functions. Fully distributed team.",
    tags: ["PostgreSQL", "Go", "Docker", "Supabase"],
    upvotes: 35,
    downvotes: 2,
    userVote: null,
    isVerifiedRecruiter: true,
    postedDate: "1 day ago",
  },
  {
    id: "post-4",
    authorName: "Karol Wiśniewski",
    companyName: "Vercel",
    jobTitle: "Developer Experience Engineer",
    jobUrl: "https://vercel.com/careers",
    workFormat: "remote",
    location: "Remote",
    description:
      "Help thousands of developers ship faster with Next.js 15, Turbopack, and AI SDK integrations.",
    tags: ["Next.js", "AI SDK", "TypeScript"],
    upvotes: 29,
    downvotes: 1,
    userVote: null,
    isVerifiedRecruiter: false,
    postedDate: "2 days ago",
  },
];

export default function CommunityPage() {
  const { t } = useI18n();
  const [posts, setPosts] = React.useState<CommunityJobPost[]>(initialCommunityPosts);
  const [search, setSearch] = React.useState("");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = React.useState(false);
  const [savedPosts, setSavedPosts] = React.useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = React.useState("");

  // Modals
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false);
  const [reportingPost, setReportingPost] = React.useState<CommunityJobPost | null>(null);

  const handleVote = (postId: string, direction: "up" | "down") => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;

        let newUp = p.upvotes;
        let newDown = p.downvotes;
        let newUserVote: "up" | "down" | null = direction;

        if (p.userVote === direction) {
          newUserVote = null;
          if (direction === "up") newUp -= 1;
          if (direction === "down") newDown -= 1;
        } else {
          if (p.userVote === "up") newUp -= 1;
          if (p.userVote === "down") newDown -= 1;

          if (direction === "up") newUp += 1;
          if (direction === "down") newDown += 1;
        }

        return {
          ...p,
          upvotes: Math.max(0, newUp),
          downvotes: Math.max(0, newDown),
          userVote: newUserVote,
        };
      })
    );
  };

  const handleSaveToKanban = (post: CommunityJobPost) => {
    setSavedPosts((prev) => ({ ...prev, [post.id]: true }));
    setToastMessage(`✓ "${post.jobTitle}" at ${post.companyName} added to your personal Kanban board!`);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleCreatePost = (data: Omit<CommunityJobPost, "id" | "upvotes" | "downvotes" | "postedDate">) => {
    const newPost: CommunityJobPost = {
      id: `post-${Date.now()}`,
      ...data,
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      postedDate: "Just now",
    };
    setPosts([newPost, ...posts]);
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.companyName.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesVerified = filterVerifiedOnly ? p.isVerifiedRecruiter : true;

    return matchesSearch && matchesVerified;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white dark:text-white flex items-center gap-2.5">
            {t.community.title}
            <Badge variant="purple" className="text-xs">
              Social Hub
            </Badge>
          </h1>
          <p className="text-xs text-slate-400">
            {t.community.subtitle}
          </p>
        </div>

        <Button
          onClick={() => setIsNewPostOpen(true)}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold gap-1.5 shadow-md shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          <span>{t.community.postJob}</span>
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in-0">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <Link href="/applications">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1">
              <span>{t.nav.applications}</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="pl-8 text-xs bg-slate-950 border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              filterVerifiedOnly
                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300"
                : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{t.community.verifiedOnly}</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className="border-slate-800/80 bg-slate-900/40 p-5 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row gap-5"
          >
            {/* Left: Upvote/Downvote Column */}
            <div className="flex md:flex-col items-center justify-center gap-1 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 shrink-0 h-fit md:min-w-[54px]">
              <button
                onClick={() => handleVote(post.id, "up")}
                className={`p-1.5 rounded-lg transition-colors ${
                  post.userVote === "up"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-500 hover:bg-slate-800 hover:text-emerald-400"
                }`}
              >
                <ArrowBigUp className="h-5 w-5" />
              </button>
              <span className="text-xs font-extrabold text-white px-1">
                {post.upvotes - post.downvotes}
              </span>
              <button
                onClick={() => handleVote(post.id, "down")}
                className={`p-1.5 rounded-lg transition-colors ${
                  post.userVote === "down"
                    ? "bg-red-500/20 text-red-400"
                    : "text-slate-500 hover:bg-slate-800 hover:text-red-400"
                }`}
              >
                <ArrowBigDown className="h-5 w-5" />
              </button>
            </div>

            {/* Right: Post Content */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-indigo-400">
                      {post.companyName}
                    </span>
                    {post.isVerifiedRecruiter && (
                      <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
                        <ShieldCheck className="h-3 w-3" />
                        {t.common.verified} Employer
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500">• {post.postedDate} by {post.authorName}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                    {post.jobTitle}
                    {post.jobUrl && (
                      <a
                        href={post.jobUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-indigo-400"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleSaveToKanban(post)}
                    size="sm"
                    className={`text-xs font-semibold gap-1.5 h-8 ${
                      savedPosts[post.id]
                        ? "bg-emerald-600 text-white"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                    }`}
                  >
                    {savedPosts[post.id] ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    <span>{savedPosts[post.id] ? t.common.savedToKanban : t.common.saveToKanban}</span>
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                {post.description}
              </p>

              {/* Tags & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
                    <MapPin className="h-3 w-3 text-slate-500" />
                    {post.location} ({post.workFormat})
                  </span>
                  {post.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] bg-slate-950 border-slate-800 text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <button
                  onClick={() => setReportingPost(post)}
                  className="text-[11px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Flag className="h-3 w-3" />
                  <span>{t.community.report}</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <NewPostDialog
        isOpen={isNewPostOpen}
        onClose={() => setIsNewPostOpen(false)}
        onPostCreated={handleCreatePost}
      />

      <ReportDialog
        isOpen={!!reportingPost}
        onClose={() => setReportingPost(null)}
        postTitle={reportingPost ? `${reportingPost.jobTitle} at ${reportingPost.companyName}` : ""}
      />
    </div>
  );
}
