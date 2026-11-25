"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Search, Home, Compass, Users, MessageCircle, PlusSquare,
  UserCircle, Music2, Heart, MessageSquare, Share2, Bookmark,
  WifiOff, X, Send, RefreshCw, Play, Film, Bell, Settings,
  ChevronDown, Loader2, Grid3X3, Menu,
} from "lucide-react";

const base = "/earn/demo-feed";

const navItems = [
  { id: "home", label: "For You", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "friends", label: "Friends", icon: Users },
  { id: "inbox", label: "Inbox", icon: MessageCircle },
  { id: "create", label: "Create", icon: PlusSquare },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const categories = [
  "All", "Singing & Dancing", "Comedy", "Sports",
  "Anime & Comics", "Relationship", "Shows", "Lifestyle",
];

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[#303030] ${className}`} />
  );
}

function AvatarSkeleton({ size = "h-11 w-11" }: { size?: string }) {
  return (
    <div className={`${size} shrink-0 animate-pulse rounded-full border border-white/10 bg-[#292929]`} />
  );
}

function NetworkNotice({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-[100] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border border-white/10 bg-[#242424] px-4 py-3 text-center text-sm text-white shadow-2xl">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0 text-yellow-400" />
        {message}
      </div>
    </div>
  );
}

function LoadingOverlay({ action }: { action: string }) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-5 backdrop-blur-[2px]">
      <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#191919] p-5 shadow-2xl">
        <div className="mb-5 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
          <span className="text-sm font-semibold text-gray-200">
            {action}...
          </span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="mt-5 h-24 w-full rounded-lg" />
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Connecting...
        </p>
      </div>
    </div>
  );
}

function VideoPlaceholder({ large = false }: { large?: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[#101010] ${large ? "h-full min-h-[420px] w-full" : "aspect-[9/16] w-full"}`}>
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#171717] via-[#080808] to-[#202020]" />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.035)_45%,transparent_70%)] bg-[length:200%_100%] animate-pulse" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/30">
          <Play className="h-7 w-7 fill-white/30 text-white/40" />
        </div>
        <p className="mt-4 whitespace-nowrap text-center text-xs text-white/30">
          Loading video...
        </p>
      </div>
      <div className="absolute bottom-5 left-4 right-16 space-y-3">
        <Skeleton className="h-3 w-32 bg-white/10" />
        <Skeleton className="h-3 w-4/5 bg-white/10" />
        <Skeleton className="h-3 w-2/3 bg-white/10" />
      </div>
    </div>
  );
}

function FeedActions({ onAction }: { onAction: (action: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-5">
      <button onClick={() => onAction("Like")} className="flex flex-col items-center gap-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929]">
          <Heart className="h-6 w-6" />
        </span>
        <span className="text-[10px] text-gray-400">--</span>
      </button>
      <button onClick={() => onAction("Comments")} className="flex flex-col items-center gap-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929]">
          <MessageSquare className="h-6 w-6" />
        </span>
        <span className="text-[10px] text-gray-400">--</span>
      </button>
      <button onClick={() => onAction("Share")} className="flex flex-col items-center gap-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929]">
          <Share2 className="h-6 w-6" />
        </span>
        <span className="text-[10px] text-gray-400">Share</span>
      </button>
      <button onClick={() => onAction("Save")} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#292929]">
        <Bookmark className="h-6 w-6" />
      </button>
    </div>
  );
}

export default function DemoFeedClient({
  initialSection = "home",
}: {
  initialSection?: string;
}) {
  const [section, setSection] = useState(initialSection.toLowerCase());
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [panel, setPanel] = useState<"comments" | "share" | null>(null);
  const [caption, setCaption] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    setSection(initialSection.toLowerCase());
    setPageLoading(true);
    setNotice("");
    setLoadingAction("");
    setSearched(false);
    setPanel(null);

    const timer = setTimeout(() => setPageLoading(false), 1800);
    return () => clearTimeout(timer);
  }, [initialSection]);

  const runAction = (action: string) => {
    if (loadingAction) return;

    setNotice("");
    setPanel(null);
    setLoadingAction(action);

    setTimeout(() => {
      setLoadingAction("");
      if (action.toLowerCase().includes("search")) {
        setSearched(true);
        setNotice("Couldn't load results. Check your connection and try again.");
      } else {
        setNotice(`Connection interrupted. ${action} was not sent.`);
      }

      setTimeout(() => setNotice(""), 3800);
    }, 2200);
  };

  const retry = () => {
    if (retrying || loadingAction) return;
    setRetrying(true);
    setNotice("");
    setLoadingAction("Reconnecting");

    setTimeout(() => {
      setLoadingAction("");
      setRetrying(false);
      setNotice("Connection is still unstable. Please try again.");
      setTimeout(() => setNotice(""), 3800);
    }, 2400);
  };

  const search = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearched(false);
    runAction("Searching");
  };

  const title =
    section === "home" ? "For You" :
    section === "search" ? "Search" :
    section === "explore" ? "Discover" :
    section === "friends" ? "Friends" :
    section === "inbox" ? "Inbox" :
    section === "create" ? "Create" :
    section === "profile" ? "Profile" :
    categories.find(c => c.toLowerCase().replace(/[^a-z0-9]+/g, "-") === section) || "Discover";

  const isCategory = !navItems.some(item => item.id === section);

  return (
    <div className="relative -m-4 min-h-screen overflow-x-hidden bg-black text-white md:-m-6">

      {/* Header */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-white/10 bg-black/95 px-3 backdrop-blur-xl sm:h-16 sm:px-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-lg p-2 hover:bg-[#242424] md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link href={`${base}/home`} className="flex items-center gap-2">
            <Music2 className="h-7 w-7 text-pink-500" />
            <span className="text-xl font-black tracking-tight">TikTok</span>
          </Link>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-[#222] px-4 py-2 text-xs text-gray-400 sm:flex">
          <WifiOff className="h-4 w-4 text-yellow-400" />
          Weak network
        </div>

        <button onClick={retry} disabled={retrying || !!loadingAction} className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-300 hover:bg-[#242424] disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Retry</span>
        </button>
      </header>

      <div className="mx-auto flex max-w-[1500px]">

        {/* Desktop navigation */}
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[220px] shrink-0 flex-col border-r border-white/10 px-3 py-5 md:flex lg:w-[245px]">
          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={`${base}/${id}`}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 font-semibold transition hover:bg-[#222] ${
                  section === id ? "bg-[#222] text-pink-400" : "text-gray-200"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-7 border-t border-white/10 pt-5">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Discover
            </p>
            {categories.slice(1, 5).map(category => (
              <Link
                key={category}
                href={`${base}/${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="block rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-[#222] hover:text-white"
              >
                {category}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-white/10 pt-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-yellow-500" />
              Connection quality: Poor
            </div>
            <div className="mt-3 flex gap-1">
              <span className="h-1.5 w-5 rounded bg-yellow-500" />
              <span className="h-1.5 w-5 rounded bg-[#444]" />
              <span className="h-1.5 w-5 rounded bg-[#444]" />
            </div>
          </div>
        </aside>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[60] bg-black/80 md:hidden" onClick={() => setMobileMenu(false)}>
            <aside className="h-full w-[280px] border-r border-white/10 bg-[#111] p-4" onClick={e => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setMobileMenu(false)}><X className="h-5 w-5" /></button>
              </div>
              {navItems.map(({ id, label, icon: Icon }) => (
                <Link key={id} href={`${base}/${id}`} onClick={() => setMobileMenu(false)} className="flex items-center gap-4 rounded-lg px-3 py-4 text-gray-200 hover:bg-[#252525]">
                  <Icon className="h-5 w-5" />{label}
                </Link>
              ))}
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1 px-0 pb-20 md:px-5 lg:px-8">
          <div className="mx-auto max-w-[1050px]">

            {/* Home feed */}
            {section === "home" && (
              <div className="mx-auto max-w-[950px]">
                <div className="sticky top-14 z-30 flex justify-center gap-8 border-b border-white/10 bg-black/95 py-4 text-sm font-semibold md:top-16">
                  <button className="border-b-2 border-white pb-2">For You</button>
                  <button onClick={() => runAction("Following feed")} className="pb-2 text-gray-500">Following</button>
                  <button onClick={() => runAction("LIVE feed")} className="pb-2 text-gray-500">LIVE</button>
                </div>

                <div className="mx-auto flex max-w-[850px] justify-center gap-5 px-2 py-4 sm:px-4 md:py-7">
                  <div className="relative min-w-0 flex-1">
                    <div className="relative mx-auto max-w-[460px] overflow-hidden rounded-none border border-white/5 bg-[#111] sm:rounded-xl">
                      <VideoPlaceholder large />
                      <div className="absolute bottom-5 left-4 right-16 space-y-3">
                        <div className="flex items-center gap-3">
                          <AvatarSkeleton />
                          <Skeleton className="h-3 w-28 bg-white/20" />
                          <Skeleton className="h-7 w-16 rounded-md bg-white/10" />
                        </div>
                        <Skeleton className="h-3 w-4/5 bg-white/20" />
                        <Skeleton className="h-3 w-2/3 bg-white/20" />
                        <Skeleton className="h-3 w-1/2 bg-white/20" />
                      </div>
                      <div className="absolute bottom-8 right-3">
                        <FeedActions onAction={runAction} />
                      </div>
                    </div>
                    <div className="mx-auto mt-4 flex max-w-[460px] items-center gap-3 px-3">
                      <AvatarSkeleton />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  </div>

                  {/* Desktop discovery rail */}
                  <aside className="hidden w-[245px] shrink-0 space-y-6 pt-4 lg:block">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <AvatarSkeleton />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-2 w-20" />
                        </div>
                        <Skeleton className="h-7 w-14 rounded-md" />
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-5">
                      <Skeleton className="mb-4 h-4 w-24" />
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="aspect-square rounded-lg" />
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>

                {/* Additional feed loading cards */}
                <div className="mx-auto max-w-[460px] space-y-4 px-2 pb-8">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 border-t border-white/10 py-4">
                      <AvatarSkeleton />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search */}
            {section === "search" && (
              <section className="mx-auto max-w-2xl px-4 py-7">
                <h1 className="mb-6 text-2xl font-bold">Search</h1>
                <form onSubmit={search} className="flex gap-2">
                  <div className="flex min-w-0 flex-1 items-center rounded-full bg-[#252525] px-4">
                    <Search className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search accounts and videos"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-500"
                    />
                    {query && <button type="button" onClick={() => setQuery("")}><X className="h-4 w-4 text-gray-400" /></button>}
                  </div>
                  <button type="submit" className="rounded-full bg-pink-600 px-5 text-sm font-semibold">Search</button>
                </form>
                <h2 className="mb-4 mt-8 text-sm font-bold text-gray-300">
                  {searched ? "Search results" : "You may like"}
                </h2>
                {searched ? (
                  <div className="rounded-xl border border-white/10 p-8 text-center">
                    <WifiOff className="mx-auto mb-3 h-8 w-8 text-gray-500" />
                    <p className="font-semibold">Couldn't load results</p>
                    <p className="mt-2 text-sm text-gray-500">Check your internet connection and try again.</p>
                    <button onClick={retry} className="mt-5 rounded-lg bg-[#292929] px-5 py-2 text-sm">Try again</button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <button key={i} onClick={() => runAction("Search")} className="flex w-full items-center gap-3 text-left">
                        <Search className="h-4 w-4 text-gray-500" />
                        <Skeleton className="h-3 w-40" />
                        <ChevronDown className="ml-auto h-4 w-4 rotate-[-90deg] text-gray-600" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Explore and categories */}
            {(section === "explore" || isCategory) && (
              <section className="px-3 py-7 sm:px-5">
                <h1 className="mb-5 text-2xl font-bold">{title}</h1>
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {categories.map(category => {
                    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    return (
                      <Link key={category} href={`${base}/${slug}`} className={`shrink-0 rounded-full px-4 py-2 text-sm ${section === slug || (section === "explore" && category === "All") ? "bg-white text-black" : "bg-[#252525] text-gray-300"}`}>
                        {category}
                      </Link>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <button key={i} onClick={() => runAction("Video")} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#171717]">
                      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#252525] via-[#111] to-[#303030]" />
                      <div className="absolute bottom-3 left-3 right-3 space-y-2">
                        <Skeleton className="h-3 w-4/5 bg-white/10" />
                        <Skeleton className="h-2 w-1/2 bg-white/10" />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Friends */}
            {section === "friends" && (
              <section className="mx-auto max-w-2xl px-4 py-7">
                <h1 className="mb-2 text-2xl font-bold">Friends</h1>
                <Skeleton className="mb-7 h-3 w-64" />
                <div className="space-y-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <AvatarSkeleton size="h-12 w-12" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <button onClick={() => runAction("Follow")} className="rounded-md bg-pink-600 px-4 py-2 text-xs font-semibold">Follow</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Inbox */}
            {section === "inbox" && (
              <section className="mx-auto max-w-2xl px-4 py-7">
                <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
                <div className="mb-6 flex gap-6 border-b border-white/10 pb-4">
                  <button className="border-b-2 border-white pb-2 text-sm font-semibold">Messages</button>
                  <button onClick={() => runAction("Activity")} className="text-sm text-gray-500">Activities</button>
                </div>
                <div className="space-y-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <button key={i} onClick={() => runAction("Conversation")} className="flex w-full items-center gap-3 text-left">
                      <AvatarSkeleton size="h-12 w-12" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                      <Skeleton className="h-2 w-8" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Profile */}
            {section === "profile" && (
              <section className="mx-auto max-w-2xl px-4 py-7">
                <div className="flex flex-col items-center text-center">
                  <AvatarSkeleton size="h-24 w-24" />
                  <Skeleton className="mt-5 h-4 w-32" />
                  <Skeleton className="mt-3 h-3 w-24" />
                  <Skeleton className="mt-5 h-3 w-56" />
                  <div className="my-7 flex gap-8 sm:gap-12">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="mx-auto h-4 w-10" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                  <button onClick={() => runAction("Profile update")} className="rounded-md bg-[#292929] px-8 py-2 text-sm font-semibold">Edit profile</button>
                </div>
                <div className="mt-8 flex justify-center border-b border-white/10 py-3">
                  <Grid3X3 className="h-5 w-5" />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <button key={i} onClick={() => runAction("Video")} className="relative aspect-[3/4] bg-[#202020]">
                      <Skeleton className="absolute inset-0 rounded-none" />
                      <Play className="absolute bottom-2 left-2 h-4 w-4 text-gray-500" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Create */}
            {section === "create" && (
              <section className="mx-auto max-w-xl px-4 py-8">
                <h1 className="mb-2 text-2xl font-bold">Create post</h1>
                <p className="mb-7 text-sm text-gray-500">Upload a video or photo.</p>
                <div className="rounded-xl border border-dashed border-white/20 bg-[#151515] p-10 text-center">
                  <Film className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-4 font-semibold">Select video or photo</p>
                  <p className="mt-2 text-xs text-gray-500">Choose media from your device</p>
                  <button onClick={() => runAction("Media upload")} className="mt-5 rounded-lg bg-pink-600 px-6 py-2 text-sm font-semibold">Select file</button>
                </div>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption..." className="mt-5 min-h-28 w-full rounded-lg bg-[#252525] p-4 text-sm outline-none placeholder:text-gray-500" />
                <button onClick={() => runAction("Post")} className="mt-4 w-full rounded-lg bg-pink-600 py-3 text-sm font-bold">Post</button>
              </section>
            )}

          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-white/10 bg-black/95 px-1 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {[
          { id: "home", icon: Home },
          { id: "explore", icon: Compass },
          { id: "create", icon: PlusSquare },
          { id: "inbox", icon: MessageCircle },
          { id: "profile", icon: UserCircle },
        ].map(({ id, icon: Icon }) => (
          <Link key={id} href={`${base}/${id}`} className={`flex min-w-0 flex-col items-center gap-1 p-2 ${section === id ? "text-pink-400" : "text-gray-300"}`}>
            <Icon className="h-6 w-6" />
            <span className="text-[9px]">{id === "home" ? "Home" : id === "explore" ? "Discover" : id === "create" ? "Create" : id === "inbox" ? "Inbox" : "Profile"}</span>
          </Link>
        ))}
      </nav>

      {/* Comments and share panels */}
      {panel && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 sm:items-center" onClick={() => setPanel(null)}>
          <div className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-[#181818] p-5 sm:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold">{panel === "comments" ? "Comments" : "Share"}</h2>
              <button onClick={() => setPanel(null)}><X className="h-5 w-5" /></button>
            </div>
            {panel === "comments" ? (
              <>
                <div className="max-h-64 space-y-5 overflow-y-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <AvatarSkeleton size="h-9 w-9" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); runAction("Comment"); }} className="mt-5 flex gap-2">
                  <input placeholder="Add a comment..." className="min-w-0 flex-1 rounded-full bg-[#292929] px-4 py-3 text-sm outline-none" />
                  <button type="submit" className="rounded-full bg-pink-600 p-3"><Send className="h-4 w-4" /></button>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                {["Copy link", "Messages", "More", "Save"].map(item => (
                  <button key={item} onClick={() => runAction(item)} className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#303030]"><Share2 className="h-5 w-5" /></span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {pageLoading && (
        <div className="pointer-events-none fixed inset-0 z-[70] bg-black/20">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-white/50" />
          </div>
        </div>
      )}

      <LoadingOverlay action={loadingAction} />
      <NetworkNotice message={notice} />
    </div>
  );
}
