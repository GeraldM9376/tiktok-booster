"use client";

import { useState } from "react";
import {
  Search, Home, Compass, Users, Film, MessageCircle,
  PlusSquare, UserCircle, Music2, WalletCards, WifiOff, RefreshCw,
} from "lucide-react";

const cards = Array.from({ length: 18 }, (_, i) => i);

const navItems = [
  { id: "Home", icon: Home },
  { id: "Search", icon: Search },
  { id: "Explore", icon: Compass },
  { id: "Friends", icon: Users },
  { id: "Videos", icon: Film },
  { id: "Messages", icon: MessageCircle },
  { id: "Create", icon: PlusSquare },
  { id: "Profile", icon: UserCircle },
];

const categories = [
  "All", "Singing & Dancing", "Comedy", "Sports",
  "Anime & Comics", "Relationship", "Shows", "Lifestyle",
];

function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`w-full rounded-xl bg-[#171717] animate-pulse ${large ? "aspect-[4/3]" : "aspect-[3/4]"}`} />
      <div className="mt-3 h-3 w-4/5 rounded bg-[#202020] animate-pulse" />
      <div className="mt-2 h-3 w-2/3 rounded bg-[#202020] animate-pulse" />
      <div className="mt-2 h-3 w-1/3 rounded bg-[#202020] animate-pulse" />
    </div>
  );
}

export default function DemoFeedClient() {
  const [activePage, setActivePage] = useState("Home");
  const [activeCategory, setActiveCategory] = useState("All");

  const openPage = (page: string) => {
    setActivePage(page);
    setActiveCategory("All");
  };

  const openCategory = (category: string) => {
    setActivePage("Explore");
    setActiveCategory(category);
  };

  const title = activePage === "Explore" && activeCategory !== "All"
    ? activeCategory
    : activePage === "Home" ? "For You"
    : activePage === "Wallet" ? "Your Credits"
    : activePage;

  return (
    <div className="min-h-[85vh] -m-4 md:-m-6 bg-black text-white overflow-hidden">
      <div className="flex min-h-[85vh]">
        <aside className="hidden sm:flex w-16 shrink-0 flex-col items-center gap-6 border-r border-[#242424] py-5">
          <button onClick={() => openPage("Home")} title="Home" className="rounded-xl p-2 hover:bg-[#222]">
            <Music2 className="h-7 w-7" />
          </button>

          {navItems.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => openPage(id)}
              title={id}
              aria-label={id}
              className={`rounded-xl p-2 hover:bg-[#222] ${activePage === id ? "text-pink-500" : "text-white"}`}
            >
              <Icon className="h-6 w-6" />
            </button>
          ))}
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6 pb-20">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <WifiOff className="h-4 w-4 text-yellow-500" />
              <span>Weak internet connection</span>
            </div>

            <button
              onClick={() => openPage("Wallet")}
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#20232b] px-4 py-2 text-sm font-semibold hover:bg-[#30343d]"
            >
              <WalletCards className="h-4 w-4 text-lime-400" />
              <span>346</span>
              <span className="text-gray-400">credits</span>
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              <p className="mt-1 text-xs text-gray-500">
                Unable to connect. Please check your internet connection.
              </p>
            </div>
            <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
          </div>

          <div className="mb-6 flex items-center gap-3 overflow-x-auto whitespace-nowrap pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => openCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                  activePage === "Explore" && activeCategory === category
                    ? "bg-white text-black"
                    : "text-gray-300 hover:bg-[#252525]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <SkeletonCard large />
              <SkeletonCard large />
            </div>
            <div className="hidden lg:block"><SkeletonCard large /></div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
              <SkeletonCard key={`${activePage}-${activeCategory}-${card}`} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 pb-8 text-center">
            <span className="h-7 w-7 rounded-full border-2 border-gray-700 border-t-white animate-spin" />
            <p className="text-sm text-gray-400">Loading {title.toLowerCase()}...</p>
            <p className="text-xs text-yellow-600">Network is unstable. Retrying connection...</p>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-[#252525] bg-black px-1 py-3 sm:hidden">
            {navItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => openPage(id)}
                title={id}
                aria-label={id}
                className={`rounded-lg p-2 ${activePage === id ? "text-pink-500" : "text-gray-300"}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
            <button onClick={() => openPage("Wallet")} title="Wallet" className="p-2 text-lime-400">
              <WalletCards className="h-5 w-5" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
