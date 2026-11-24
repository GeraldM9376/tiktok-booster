"use client";

import Link from "next/link";
import {
  Search, Home, Compass, Users, Film, MessageCircle,
  PlusSquare, UserCircle, Music2, WalletCards, WifiOff,
  RefreshCw, Heart, Bell, Settings, ChevronRight, Video,
} from "lucide-react";

const nav = [
  { id: "home", label: "For You", icon: Home },
  { id: "search", label: "Search", icon: Search },
  { id: "explore", label: "Explore", icon: Compass },
  { id: "friends", label: "Friends", icon: Users },
  { id: "videos", label: "Videos", icon: Film },
  { id: "messages", label: "Inbox", icon: MessageCircle },
  { id: "create", label: "Upload", icon: PlusSquare },
  { id: "profile", label: "Profile", icon: UserCircle },
];

const categories = [
  "All", "Singing & Dancing", "Comedy", "Sports",
  "Anime & Comics", "Relationship", "Shows", "Lifestyle",
];

const titles: Record<string, string> = {
  home: "For You", search: "Search", explore: "Explore",
  friends: "Friends", videos: "Videos", messages: "Inbox",
  create: "Upload video", profile: "Profile", wallet: "Balance",
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#252525] ${className}`} />;
}

function VideoGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="min-w-0">
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}

function PeopleList() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function MessagesList() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-10" />
            </div>
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DemoFeedClient({
  section = "home",
  category = "All",
}: {
  section?: string;
  category?: string;
}) {
  const title = titles[section] || "For You";

  return (
    <div className="min-h-[85vh] -m-4 overflow-hidden bg-black text-white md:-m-6">
      <div className="flex min-h-[85vh]">
        <aside className="hidden w-[220px] shrink-0 border-r border-[#242424] px-3 py-5 sm:block">
          <Link href="/earn/demo-feed" className="mb-7 flex items-center gap-2 px-3 text-2xl font-black tracking-tight">
            <Music2 className="h-8 w-8 text-pink-500" />
            <span>tiktok</span>
          </Link>

          <nav className="space-y-1">
            {nav.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={`/earn/demo-feed/${id}`}
                className={`flex items-center gap-4 rounded-lg px-3 py-3 text-[15px] font-semibold transition hover:bg-[#202020] ${
                  section === id ? "bg-[#202020] text-pink-500" : "text-white"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="my-5 border-t border-[#292929]" />
          <Link href="/earn/demo-feed/wallet" className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-[#202020]">
            <WalletCards className="h-5 w-5 text-lime-400" />
            Your balance
          </Link>
          <div className="mt-8 rounded-xl bg-[#171717] p-3 text-xs text-gray-400">
            <p className="font-semibold text-white">Suggested accounts</p>
            <div className="mt-4 space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-8 md:pt-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-yellow-500">
              <WifiOff className="h-4 w-4" />
              <span>Weak connection · Reconnecting...</span>
            </div>
            <Link href="/earn/demo-feed/wallet" className="flex items-center gap-2 rounded-full bg-[#202020] px-4 py-2 text-sm font-semibold hover:bg-[#303030]">
              <WalletCards className="h-4 w-4 text-lime-400" />
              346 credits
            </Link>
          </div>

          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              <p className="mt-1 text-xs text-gray-500">Discover videos, creators and trends</p>
            </div>
            <div className="flex gap-4 text-gray-400">
              <Bell className="h-5 w-5" />
              <Settings className="h-5 w-5" />
            </div>
          </header>

          {section === "home" && (
            <>
              <div className="mb-5 flex gap-6 border-b border-[#292929] pb-3 text-sm font-semibold">
                <span className="border-b-2 border-white pb-3 text-white">For You</span>
                <span className="text-gray-500">Following</span>
                <span className="text-gray-500">LIVE</span>
              </div>
              <VideoGrid count={12} />
            </>
          )}

          {section === "search" && (
            <>
              <div className="mb-6 flex items-center gap-3 rounded-full bg-[#252525] px-4 py-3">
                <Search className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-500">Search accounts and videos</span>
                <span className="ml-auto text-sm font-semibold">Search</span>
              </div>
              <h2 className="mb-4 font-semibold">You may like</h2>
              <VideoGrid count={8} />
            </>
          )}

          {section === "explore" && (
            <>
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {categories.map((name) => (
                  <Link
                    key={name}
                    href={`/earn/demo-feed/explore?category=${encodeURIComponent(name)}`}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                      category === name ? "bg-white text-black" : "bg-[#242424] text-gray-300"
                    }`}
                  >
                    {name}
                  </Link>
                ))}
              </div>
              <h2 className="mb-4 text-lg font-semibold">{category} videos</h2>
              <VideoGrid count={12} />
            </>
          )}

          {section === "friends" && (
            <>
              <div className="mb-6 flex gap-3">
                <Skeleton className="h-24 flex-1 rounded-xl" />
                <Skeleton className="h-24 flex-1 rounded-xl" />
              </div>
              <h2 className="mb-4 font-semibold">People you may know</h2>
              <PeopleList />
            </>
          )}

          {section === "videos" && (
            <>
              <div className="mb-5 flex gap-6 border-b border-[#292929] pb-3 text-sm">
                <span className="font-semibold text-white">Popular</span>
                <span className="text-gray-500">Recently uploaded</span>
                <span className="text-gray-500">Liked</span>
              </div>
              <VideoGrid count={16} />
            </>
          )}

          {section === "messages" && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm text-gray-400">Recent conversations</span>
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <MessagesList />
            </>
          )}

          {section === "create" && (
            <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-[#444] bg-[#141414] p-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#252525]">
                <Video className="h-9 w-9 text-pink-500" />
              </div>
              <h2 className="text-lg font-bold">Upload video</h2>
              <p className="mt-2 text-sm text-gray-500">Share a video with the community</p>
              <div className="mt-6 rounded-lg bg-pink-600 py-3 text-sm font-bold">Select video</div>
              <p className="mt-4 text-xs text-gray-600">MP4 or WebM · Connection required</p>
            </div>
          )}

          {section === "profile" && (
            <>
              <div className="mb-8 flex flex-col items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="mt-4 h-4 w-36" />
                <Skeleton className="mt-3 h-3 w-24" />
                <div className="mt-5 flex gap-8">
                  {["Following", "Followers", "Likes"].map((v) => (
                    <div key={v} className="space-y-2">
                      <Skeleton className="mx-auto h-4 w-10" />
                      <span className="text-xs text-gray-500">{v}</span>
                    </div>
                  ))}
                </div>
                <Skeleton className="mt-5 h-9 w-36 rounded-md" />
              </div>
              <VideoGrid count={9} />
            </>
          )}

          {section === "wallet" && (
            <div className="mx-auto max-w-xl space-y-5">
              <div className="rounded-2xl bg-gradient-to-br from-[#27213b] to-[#171717] p-6">
                <p className="text-sm text-gray-400">Available credits</p>
                <p className="mt-3 text-4xl font-black">346</p>
                <p className="mt-2 text-xs text-gray-500">Demo account balance</p>
                <div className="mt-6 rounded-lg bg-white/10 py-3 text-center text-sm font-semibold">Top up credits</div>
              </div>
              <h2 className="font-semibold">Recent activity</h2>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-[#171717] p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-14" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-3 border-t border-[#242424] py-8 text-center">
            <RefreshCw className="h-7 w-7 animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Connecting to server...</p>
            <p className="text-xs text-yellow-600">Your connection is unstable. Retrying automatically.</p>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[#292929] bg-black px-1 py-2 sm:hidden">
        {nav.map(({ id, icon: Icon }) => (
          <Link key={id} href={`/earn/demo-feed/${id}`} aria-label={id} className={`p-2 ${section === id ? "text-pink-500" : "text-gray-300"}`}>
            <Icon className="h-5 w-5" />
          </Link>
        ))}
        <Link href="/earn/demo-feed/wallet" aria-label="Wallet" className="p-2 text-lime-400">
          <WalletCards className="h-5 w-5" />
        </Link>
      </nav>
    </div>
  );
}
