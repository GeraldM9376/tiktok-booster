"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Home, Compass, Users, Film, MessageCircle,
  PlusSquare, UserCircle, Music2, Heart, MessageSquare,
  Share2, Bookmark, WifiOff, X, Send, ArrowLeft,
  RefreshCw, Play, MoreHorizontal, ImagePlus,
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

const videos = [
  {
    id: 1, creator: "maya.rose", name: "Maya Rose",
    caption: "Little moments make the biggest memories ✨",
    tags: "#lifestyle #dailyvlog", likes: "24.8K", comments: "438",
    image: "photo-1534528741775-53994a69daeb",
  },
  {
    id: 2, creator: "kevincreates", name: "Kevin Creates",
    caption: "Wait for the final result 😂",
    tags: "#comedy #funny", likes: "18.2K", comments: "291",
    image: "photo-1500648767791-00dcc994a43e",
  },
  {
    id: 3, creator: "nina.daily", name: "Nina",
    caption: "A little sunshine for your day ☀️",
    tags: "#travel #beautiful", likes: "56.1K", comments: "892",
    image: "photo-1524504388940-b1c1722653e1",
  },
  {
    id: 4, creator: "alexmoves", name: "Alex Moves",
    caption: "Never skip your practice 💪",
    tags: "#fitness #motivation", likes: "9,842", comments: "127",
    image: "photo-1506794778202-cad84cf45f1d",
  },
  {
    id: 5, creator: "sarah.vibes", name: "Sarah Vibes",
    caption: "Today's outfit inspiration 🌸",
    tags: "#fashion #style", likes: "31.4K", comments: "564",
    image: "photo-1515886657613-9f3515b0c78f",
  },
  {
    id: 6, creator: "daniel.jpg", name: "Daniel",
    caption: "Somewhere I'd rather be 🌍",
    tags: "#adventure #nature", likes: "12.7K", comments: "203",
    image: "photo-1517841905240-472988babdf9",
  },
  {
    id: 7, creator: "luna.music", name: "Luna Music",
    caption: "This song is stuck in my head 🎵",
    tags: "#music #singing", likes: "42.3K", comments: "718",
    image: "photo-1531123897727-8f129e1688ce",
  },
  {
    id: 8, creator: "chrisworld", name: "Chris World",
    caption: "Weekend adventures with friends",
    tags: "#friends #weekend", likes: "7,621", comments: "94",
    image: "photo-1529139574466-a303027c1d8b",
  },
];

const people = [
  { name: "Maya Rose", username: "@maya.rose", image: videos[0].image },
  { name: "Kevin Creates", username: "@kevincreates", image: videos[1].image },
  { name: "Nina", username: "@nina.daily", image: videos[2].image },
  { name: "Alex Moves", username: "@alexmoves", image: videos[3].image },
  { name: "Sarah Vibes", username: "@sarah.vibes", image: videos[4].image },
];

function imageUrl(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=650&q=80`;
}

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function Avatar({ image, size = "h-11 w-11" }: {
  image: string; size?: string;
}) {
  return (
    <div
      className={`${size} shrink-0 rounded-full bg-[#292929] bg-cover bg-center ring-1 ring-white/20`}
      style={{ backgroundImage: `url("${imageUrl(image)}")` }}
    />
  );
}

function NetworkNotice({ notice }: { notice: string }) {
  if (!notice) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-[80] w-[90%] max-w-sm -translate-x-1/2 rounded-xl border border-[#454545] bg-[#242424] px-4 py-3 text-center text-sm text-white shadow-xl">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 text-yellow-400" />
        {notice}
      </div>
    </div>
  );
}

export default function DemoFeedClient({
  initialSection = "home",
}: {
  initialSection?: string;
}) {
  const [section, setSection] = useState(initialSection);
  const [feed, setFeed] = useState(videos);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState<"comments" | "share" | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[number] | null>(null);
  const [comment, setComment] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    setSection(initialSection.toLowerCase());
    setFeed(shuffle(videos));
    setQuery("");
    setSearched(false);
    setNotice("");
    setPanel(null);
  }, [initialSection]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3200);
  };

  const attemptAction = (action: string) => {
    showNotice(`Connection interrupted. ${action} was not sent.`);
  };

  const retry = () => {
    setRetrying(true);
    showNotice("Reconnecting...");
    setTimeout(() => {
      setRetrying(false);
      showNotice("Connection is still unstable. Please try again.");
    }, 1200);
  };

  const search = (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
    showNotice("Searching...");
    setTimeout(() => {
      showNotice("Couldn't load search results. Check your connection.");
    }, 1100);
  };

  const openComments = (video: (typeof videos)[number]) => {
    setSelectedVideo(video);
    setPanel("comments");
  };

  const title = section === "home" ? "For You"
    : section === "search" ? "Search"
    : section === "explore" ? "Discover"
    : section === "friends" ? "Friends"
    : section === "inbox" ? "Inbox"
    : section === "create" ? "Create"
    : section === "profile" ? "Profile"
    : categories.find(c => c.toLowerCase().replace(/[^a-z0-9]+/g, "-") === section) || "Discover";

  const isCategory = !navItems.some(item => item.id === section);

  return (
    <div className="relative -m-4 min-h-screen overflow-hidden bg-black text-white md:-m-6">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur md:px-7">
        <Link href={`${base}/home`} className="flex items-center gap-2">
          <Music2 className="h-7 w-7 text-pink-500" />
          <span className="text-xl font-black tracking-tight">TikTok</span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full bg-[#252525] px-3 py-2 text-xs text-gray-300 sm:flex">
          <WifiOff className="h-4 w-4 text-yellow-400" />
          Unstable connection
        </div>

        <button
          onClick={retry}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-gray-300 hover:bg-[#242424]"
        >
          <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Retry</span>
        </button>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        {/* Sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-[225px] shrink-0 flex-col border-r border-white/10 px-3 py-5 md:flex">
          <nav className="space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <Link
                key={id}
                href={`${base}/${id}`}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 font-semibold transition hover:bg-[#242424] ${
                  section === id ? "bg-[#242424] text-pink-400" : "text-gray-200"
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-white/10 pt-4 text-xs text-gray-500">
            Connection quality: Poor
            <div className="mt-2 flex gap-1">
              <span className="h-1.5 w-5 rounded bg-yellow-500" />
              <span className="h-1.5 w-5 rounded bg-[#444]" />
              <span className="h-1.5 w-5 rounded bg-[#444]" />
            </div>
          </div>
        </aside>

        {/* Main page */}
        <main className="min-w-0 flex-1 px-3 pb-24 sm:px-5 md:px-8">
          <div className="mx-auto max-w-4xl">
            {section === "home" && (
              <>
                <div className="sticky top-16 z-30 flex justify-center gap-8 border-b border-white/10 bg-black/95 py-4 text-sm font-semibold">
                  <button className="border-b-2 border-white pb-2">For You</button>
                  <button onClick={() => attemptAction("Following feed")} className="pb-2 text-gray-500 hover:text-white">Following</button>
                  <button onClick={() => attemptAction("LIVE feed")} className="pb-2 text-gray-500 hover:text-white">LIVE</button>
                </div>
                <div className="mx-auto max-w-2xl">
                  {feed.slice(0, 6).map((video, index) => (
                    <article key={video.id} className="flex gap-3 border-b border-white/10 py-5">
                      <Avatar image={video.image} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{video.name}</p>
                            <p className="text-xs text-gray-500">@{video.creator} · {index + 1}h ago</p>
                          </div>
                          <button onClick={() => attemptAction("Follow request")} className="rounded-md border border-pink-500 px-4 py-1 text-sm font-semibold text-pink-500 hover:bg-pink-500/10">Follow</button>
                        </div>
                        <p className="mt-3 text-sm">{video.caption}</p>
                        <p className="mt-1 text-xs text-sky-300">{video.tags}</p>
                        <div
                          className="relative mt-3 aspect-[4/5] max-h-[520px] overflow-hidden rounded-xl bg-[#171717] bg-cover bg-center"
                          style={{ backgroundImage: `url("${imageUrl(video.image)}")` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                          <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 fill-white/70 text-white/70" />
                          <span className="absolute bottom-3 left-3 rounded bg-black/40 px-2 py-1 text-xs">Video preview</span>
                        </div>
                        <div className="mt-3 flex items-center gap-6 text-sm text-gray-300">
                          <button onClick={() => attemptAction("Like")} className="flex items-center gap-2 hover:text-pink-400"><Heart className="h-5 w-5" />{video.likes}</button>
                          <button onClick={() => openComments(video)} className="flex items-center gap-2 hover:text-white"><MessageSquare className="h-5 w-5" />{video.comments}</button>
                          <button onClick={() => { setSelectedVideo(video); setPanel("share"); }} className="flex items-center gap-2 hover:text-white"><Share2 className="h-5 w-5" />Share</button>
                          <button onClick={() => attemptAction("Save")} className="ml-auto hover:text-white"><Bookmark className="h-5 w-5" /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {section === "search" && (
              <section className="mx-auto max-w-2xl py-8">
                <h1 className="mb-6 text-2xl font-bold">Search</h1>
                <form onSubmit={search} className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-lg bg-[#252525] px-4">
                    <Search className="h-5 w-5 shrink-0 text-gray-400" />
                    <input
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search accounts and videos"
                      className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-500"
                    />
                    {query && <button type="button" onClick={() => setQuery("")}><X className="h-4 w-4 text-gray-400" /></button>}
                  </div>
                  <button type="submit" className="rounded-lg bg-pink-600 px-5 text-sm font-semibold hover:bg-pink-500">Search</button>
                </form>
                <h2 className="mb-4 mt-8 text-sm font-bold text-gray-300">{searched ? `Results for "${query}"` : "You may like"}</h2>
                {searched ? (
                  <div className="rounded-xl border border-white/10 p-8 text-center">
                    <WifiOff className="mx-auto mb-3 h-8 w-8 text-gray-500" />
                    <p className="font-semibold">Couldn't load results</p>
                    <p className="mt-2 text-sm text-gray-500">Check your internet connection and try again.</p>
                    <button onClick={retry} className="mt-5 rounded-lg bg-[#292929] px-5 py-2 text-sm">Try again</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {["Popular videos", "Trending creators", "Music and sounds", "Comedy clips", "Daily lifestyle"].map((item, i) => (
                      <button key={item} onClick={() => { setQuery(item); setSearched(true); attemptAction("Search"); }} className="flex w-full items-center gap-3 text-left text-sm hover:text-pink-400">
                        <Search className="h-4 w-4 text-gray-500" />{item}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(section === "explore" || isCategory) && (
              <section className="py-7">
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
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {feed.map((video, i) => (
                    <button key={video.id} onClick={() => attemptAction("Video")} className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#222] text-left">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl(video.image)}")` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-2 text-xs font-semibold">{video.caption}</div>
                      <div className="absolute bottom-1 right-2 text-[10px] text-white/80">▶ {video.likes}</div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {section === "friends" && (
              <section className="py-7">
                <h1 className="mb-2 text-2xl font-bold">Friends</h1>
                <p className="mb-7 text-sm text-gray-500">Find people and see what your friends are sharing.</p>
                <div className="space-y-5">
                  {shuffle(people).map(person => (
                    <div key={person.username} className="flex items-center gap-3">
                      <Avatar image={person.image} size="h-12 w-12" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{person.name}</p>
                        <p className="text-xs text-gray-500">{person.username}</p>
                      </div>
                      <button onClick={() => attemptAction("Follow request")} className="rounded-md bg-pink-600 px-4 py-2 text-xs font-semibold">Follow</button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {section === "inbox" && (
              <section className="py-7">
                <h1 className="mb-6 text-2xl font-bold">Inbox</h1>
                <div className="mb-6 flex gap-3 border-b border-white/10 pb-4">
                  <button className="border-b-2 border-white pb-2 text-sm font-semibold">Messages</button>
                  <button onClick={() => attemptAction("Activity")} className="pb-2 text-sm text-gray-500">Activities</button>
                </div>
                <div className="space-y-5">
                  {shuffle(people).map((person, i) => (
                    <button key={person.username} onClick={() => attemptAction("Conversation")} className="flex w-full items-center gap-3 text-left">
                      <Avatar image={person.image} size="h-12 w-12" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{person.name}</p>
                        <p className="mt-1 truncate text-xs text-gray-500">{["Hey! How are you?", "That video was amazing!", "Are you free today?", "Just shared a video with you"][i % 4]}</p>
                      </div>
                      <span className="text-xs text-gray-600">{i + 1}h</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {section === "profile" && (
              <section className="py-7">
                <div className="flex flex-col items-center text-center">
                  <Avatar image={videos[0].image} size="h-24 w-24" />
                  <h1 className="mt-4 text-xl font-bold">Your profile</h1>
                  <p className="mt-1 text-sm text-gray-500">@your_username</p>
                  <p className="mt-3 text-sm text-gray-300">Share your moments with the world.</p>
                  <div className="my-6 flex gap-10 text-center">
                    <div><p className="font-bold">128</p><p className="text-xs text-gray-500">Following</p></div>
                    <div><p className="font-bold">2.4K</p><p className="text-xs text-gray-500">Followers</p></div>
                    <div><p className="font-bold">18.6K</p><p className="text-xs text-gray-500">Likes</p></div>
                  </div>
                  <button onClick={() => attemptAction("Profile update")} className="rounded-md bg-[#292929] px-8 py-2 text-sm font-semibold">Edit profile</button>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-1">
                  {feed.map(video => (
                    <button key={video.id} onClick={() => attemptAction("Video")} className="relative aspect-[3/4] overflow-hidden bg-[#222]">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${imageUrl(video.image)}")` }} />
                      <Play className="absolute bottom-2 left-2 h-4 w-4 fill-white" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {section === "create" && (
              <section className="mx-auto max-w-xl py-8">
                <h1 className="mb-2 text-2xl font-bold">Create post</h1>
                <p className="mb-7 text-sm text-gray-500">Share a video or photo with your community.</p>
                <div className="rounded-xl border border-dashed border-white/20 bg-[#151515] p-10 text-center">
                  <ImagePlus className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-4 font-semibold">Select video or photo</p>
                  <p className="mt-2 text-xs text-gray-500">Choose media from your device</p>
                  <button onClick={() => attemptAction("Media upload")} className="mt-5 rounded-lg bg-pink-600 px-6 py-2 text-sm font-semibold">Select file</button>
                </div>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Write a caption..." className="mt-5 min-h-28 w-full rounded-lg bg-[#252525] p-4 text-sm outline-none placeholder:text-gray-500" />
                <button onClick={() => attemptAction("Post")} className="mt-4 w-full rounded-lg bg-pink-600 py-3 text-sm font-bold">Post</button>
              </section>
            )}

            {section !== "home" && section !== "search" && section !== "explore" && section !== "friends" && section !== "inbox" && section !== "profile" && section !== "create" && !isCategory && (
              <div className="py-10 text-center">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="mt-3 text-sm text-gray-500">This page is not available right now.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-white/10 bg-black px-1 py-3 md:hidden">
        {[
          { id: "home", icon: Home },
          { id: "explore", icon: Compass },
          { id: "create", icon: PlusSquare },
          { id: "inbox", icon: MessageCircle },
          { id: "profile", icon: UserCircle },
        ].map(({ id, icon: Icon }) => (
          <Link key={id} href={`${base}/${id}`} className={`p-2 ${section === id ? "text-pink-400" : "text-gray-300"}`}>
            <Icon className="h-6 w-6" />
          </Link>
        ))}
      </nav>

      {/* Comment and share panels */}
      {panel && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 sm:items-center" onClick={() => setPanel(null)}>
          <div className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-[#181818] p-5 sm:rounded-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold">{panel === "comments" ? `Comments · ${selectedVideo?.comments || ""}` : "Share"}</h2>
              <button onClick={() => setPanel(null)}><X className="h-5 w-5" /></button>
            </div>
            {panel === "comments" ? (
              <>
                <div className="max-h-64 space-y-4 overflow-y-auto">
                  {["This is amazing!", "Love this video ❤️", "Where was this taken?", "Absolutely beautiful!"].map((item, i) => (
                    <div key={item} className="flex gap-3">
                      <Avatar image={people[i].image} size="h-8 w-8" />
                      <div><p className="text-xs font-semibold">{people[i].username}</p><p className="mt-1 text-sm text-gray-300">{item}</p></div>
                    </div>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); if (comment.trim()) { attemptAction("Comment"); setComment(""); } }} className="mt-5 flex gap-2">
                  <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." className="min-w-0 flex-1 rounded-full bg-[#292929] px-4 py-3 text-sm outline-none" />
                  <button type="submit" className="rounded-full bg-pink-600 p-3"><Send className="h-4 w-4" /></button>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-4 gap-4 text-center text-xs">
                {["Copy link", "Messages", "More", "Save"].map((item, i) => (
                  <button key={item} onClick={() => { setPanel(null); attemptAction(item); }} className="flex flex-col items-center gap-2">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#303030]"><Share2 className="h-5 w-5" /></span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <NetworkNotice notice={notice} />
    </div>
  );
}
