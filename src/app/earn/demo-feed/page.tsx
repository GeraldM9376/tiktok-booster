import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  Search, Home, Compass, Users, Film, MessageCircle,
  PlusSquare, UserCircle, Heart, Music2
} from "lucide-react";

const cards = Array.from({ length: 18 }, (_, i) => i);

function SkeletonCard({ large = false }: { large?: boolean }) {
  return (
    <div className="min-w-0">
      <div className={`w-full rounded-xl bg-[#202020] animate-pulse ${large ? "aspect-[4/3]" : "aspect-[3/4]"}`} />
      <div className="mt-3 h-3 w-4/5 rounded bg-[#242424] animate-pulse" />
      <div className="mt-2 h-3 w-2/3 rounded bg-[#242424] animate-pulse" />
      <div className="mt-2 h-3 w-1/3 rounded bg-[#242424] animate-pulse" />
    </div>
  );
}

function DemoFeed() {
  return (
    <div className="min-h-[85vh] -m-4 md:-m-6 bg-black text-white overflow-hidden">
      <div className="flex min-h-[85vh]">
        <aside className="hidden sm:flex w-16 shrink-0 flex-col items-center gap-7 border-r border-[#242424] py-5">
          <Music2 className="h-7 w-7" />
          <Search className="h-6 w-6" />
          <Home className="h-6 w-6" />
          <Compass className="h-6 w-6 text-pink-500" />
          <Users className="h-6 w-6" />
          <Film className="h-6 w-6" />
          <MessageCircle className="h-6 w-6" />
          <PlusSquare className="h-6 w-6" />
          <UserCircle className="h-6 w-6" />
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap pb-6 text-sm font-semibold text-gray-300">
            {["All", "Singing & Dancing", "Comedy", "Sports", "Anime & Comics", "Relationship", "Shows", "Lifestyle"].map((item, i) => (
              <span key={item} className={i === 0 ? "rounded-full bg-[#292929] px-4 py-2 text-white" : ""}>
                {item}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <SkeletonCard large />
              <SkeletonCard large />
            </div>
            <div className="hidden lg:block">
              <SkeletonCard large />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => <SkeletonCard key={card} />)}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-400">
            <span className="h-5 w-5 rounded-full border-2 border-gray-600 border-t-white animate-spin" />
            Loading videos...
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DemoFeedPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <DemoFeed />
    </DashboardShell>
  );
}
