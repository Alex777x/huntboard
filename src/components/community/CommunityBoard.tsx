"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowBigUp,
  ArrowBigDown,
  ExternalLink,
  Plus,
  Search,
  ShieldCheck,
  Bookmark,
  Check,
  Flag,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { NewPostDialog, CommunityJobPost } from "@/components/community/NewPostDialog";
import { ReportDialog } from "@/components/community/ReportDialog";
import { useI18n } from "@/components/providers/I18nProvider";
import { safeHref, localeIncludes } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface CommunityBoardProps {
  isRecruiterMode?: boolean;
  defaultAuthorName?: string;
}

export function CommunityBoard({
  isRecruiterMode = false,
  defaultAuthorName,
}: CommunityBoardProps) {
  const { t, locale, fmt } = useI18n();
  const [posts, setPosts] = React.useState<CommunityJobPost[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterVerifiedOnly, setFilterVerifiedOnly] = React.useState(false);
  const [savedPosts, setSavedPosts] = React.useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = React.useState("");
  const supabase = React.useMemo(() => createClient(), []);

  // Modals
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false);
  const [reportingPost, setReportingPost] = React.useState<CommunityJobPost | null>(null);

  React.useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }
      
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          author:profiles!author_id (full_name, role)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
        
      if (data && !error) {
        setPosts(data.map((d: any) => ({
          id: d.id,
          authorName: d.author?.full_name || "Unknown Author",
          companyName: d.company_name,
          jobTitle: d.title,
          jobUrl: d.job_url,
          workFormat: d.work_format,
          location: d.location,
          description: d.description,
          tags: d.tags || [],
          upvotes: d.upvotes || 0,
          downvotes: d.downvotes || 0,
          userVote: null,
          isVerifiedRecruiter: d.author?.role === "recruiter",
          postedDate: d.created_at,
        })));
      }
    }
    fetchData();
  }, [supabase]);

  const handleVote = async (postId: string, direction: "up" | "down") => {
    let finalUp = 0;
    let finalDown = 0;
    let finalUserVote: "up" | "down" | null = null;
    const previousPosts = posts;

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

        finalUp = Math.max(0, newUp);
        finalDown = Math.max(0, newDown);
        finalUserVote = newUserVote;

        return {
          ...p,
          upvotes: finalUp,
          downvotes: finalDown,
          userVote: newUserVote,
        };
      })
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (finalUserVote === null) {
        // Remove vote
        const { error } = await supabase
          .from("community_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) {
          console.error("Failed to remove vote:", error);
          setPosts(previousPosts);
        }
      } else {
        // Upsert vote
        const { error } = await supabase
          .from("community_votes")
          .upsert({
            post_id: postId,
            user_id: user.id,
            is_upvote: finalUserVote === "up"
          }, { onConflict: "post_id,user_id" });
        if (error) {
          console.error("Failed to vote:", error);
          setPosts(previousPosts);
        }
      }
    }
  };

  const handleSaveToKanban = async (post: CommunityJobPost) => {
    setSavedPosts((prev) => ({ ...prev, [post.id]: true }));
    setToastMessage(`✓ "${post.jobTitle}" at ${post.companyName} added to your personal Kanban board!`);
    setTimeout(() => setToastMessage(""), 4000);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("applications").insert({
        profile_id: user.id,
        job_title: post.jobTitle,
        job_url: post.jobUrl || null,
        job_description: post.description || null,
        source: "community",
        work_format: (post.workFormat as any) || "remote",
        job_location: post.location || null,
        status: "wishlist",
        notes: `Imported from Community Post by ${post.authorName}`,
      });
    }
  };

  const handleCreatePost = async (data: Omit<CommunityJobPost, "id" | "upvotes" | "downvotes" | "postedDate">) => {
    const { data: { user } } = await supabase.auth.getUser();

    const profileId = user?.id || "00000000-0000-0000-0000-000000000001";
    const payload = {
      author_id: profileId,
      company_name: data.companyName,
      title: data.jobTitle,
      job_url: data.jobUrl || null,
      work_format: data.workFormat || "remote",
      location: data.location || null,
      description: data.description,
      tags: data.tags || [],
      upvotes: 1,
      downvotes: 0,
      created_at: new Date().toISOString(),
    };

    if (user) {
      const { data: inserted, error } = await supabase
        .from("community_posts")
        .insert(payload)
        .select(`*, author:profiles!author_id (full_name, role)`)
        .single();

      if (!error && inserted) {
        const newPost: CommunityJobPost = {
          id: inserted.id,
          authorName: inserted.author?.full_name || data.authorName,
          companyName: inserted.company_name,
          jobTitle: inserted.title,
          jobUrl: inserted.job_url,
          workFormat: inserted.work_format,
          location: inserted.location,
          description: inserted.description,
          tags: inserted.tags || [],
          upvotes: inserted.upvotes || 1,
          downvotes: inserted.downvotes || 0,
          userVote: "up",
          isVerifiedRecruiter: inserted.author?.role === "recruiter",
          postedDate: inserted.created_at,
        };
        setPosts([newPost, ...posts]);
        return;
      }
    }

    const fallbackPost: CommunityJobPost = {
      id: crypto.randomUUID(),
      ...data,
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      isVerifiedRecruiter: isRecruiterMode ? true : data.isVerifiedRecruiter,
      postedDate: new Date().toISOString(),
    };
    setPosts([fallbackPost, ...posts]);
  };

  const handleReportSubmit = async (reason: string) => {
    if (!reportingPost) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("community_reports").insert({
        post_id: reportingPost.id,
        reporter_id: user.id,
        reason,
        status: "pending"
      });
    }
    setReportingPost(null);
    setToastMessage("Report submitted successfully.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const filteredPosts = React.useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        localeIncludes(p.jobTitle, search, locale) ||
        localeIncludes(p.companyName, search, locale) ||
        p.tags.some((tag) => localeIncludes(tag, search, locale));

      const matchesVerified = filterVerifiedOnly ? p.isVerifiedRecruiter : true;

      return matchesSearch && matchesVerified;
    });
  }, [posts, search, filterVerifiedOnly, locale]);

  return (
    <div className="w-full space-y-6">
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white text-xs px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            {t.community.title}
            <Badge variant="purple" className="text-xs">
              {isRecruiterMode ? t.community.employerCommunity : t.community.socialHub}
            </Badge>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
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
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in-0">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <Link href={isRecruiterMode ? "/recruiter/jobs" : "/applications"}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-7 gap-1">
              <span>{isRecruiterMode ? t.nav.hiringPipeline : t.nav.applications}</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.community.searchPlaceholder}
            className="pl-8 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              filterVerifiedOnly
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
            className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-5 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row gap-5 shadow-xs"
          >
            {/* Left: Upvote/Downvote Column */}
            <div className="flex md:flex-col items-center justify-center gap-1 bg-slate-50 dark:bg-slate-950/80 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80 shrink-0 h-fit md:min-w-[54px]">
              <button
                onClick={() => handleVote(post.id, "up")}
                className={`p-1.5 rounded-lg transition-colors ${
                  post.userVote === "up"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                <ArrowBigUp className="h-5 w-5" />
              </button>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white px-1">
                {post.upvotes - post.downvotes}
              </span>
              <button
                onClick={() => handleVote(post.id, "down")}
                className={`p-1.5 rounded-lg transition-colors ${
                  post.userVote === "down"
                    ? "bg-red-500/20 text-red-600 dark:text-red-400"
                    : "text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400"
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
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {post.companyName}
                    </span>
                    {post.isVerifiedRecruiter && (
                      <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
                        <ShieldCheck className="h-3 w-3" />
                        {t.community.verifiedEmployer}
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      • {fmt.formatRelativeTime(post.postedDate)} {t.community.by} {post.authorName}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                    {post.jobTitle}
                    {post.jobUrl && (
                      <a
                        href={safeHref(post.jobUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
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
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                    }`}
                  >
                    {savedPosts[post.id] ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    <span>{savedPosts[post.id] ? t.common.savedToKanban : t.common.saveToKanban}</span>
                  </Button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 font-sans">
                {post.description}
              </p>

              {/* Tags & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                    <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                    {post.location} ({post.workFormat})
                  </span>
                  {post.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <button
                  onClick={() => setReportingPost(post)}
                  className="text-[11px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
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
        authorName={defaultAuthorName || (isRecruiterMode ? "Jessica Miller (Stripe Recruiter)" : t.common.anonymousUser)}
      />

      <ReportDialog
        isOpen={!!reportingPost}
        onClose={() => setReportingPost(null)}
        onReportSubmitted={handleReportSubmit}
        postTitle={reportingPost ? `${reportingPost.jobTitle} at ${reportingPost.companyName}` : ""}
      />
    </div>
  );
}
