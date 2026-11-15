// src/components/layout/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  ChevronLeft,
  LayoutDashboard,
  Compass,
  ListTodo,
  Wallet,
  Trophy,
  Gift,
  Users,
  Settings,
  HelpCircle,
  Video,
  BarChart3,
  Megaphone,
  ShieldCheck,
  UserCog,
  Receipt,
  LogOut,
} from "lucide-react";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/actions";

type SidebarType = "earner" | "creator" | "admin";

const ICONS: Record<string, React.ElementType> = {
  "/earn/dashboard": LayoutDashboard,
  "/earn/marketplace": Compass,
  "/earn/tasks/daily": ListTodo,
  "/earn/earnings": Wallet,
  "/earn/rank": Trophy,
  "/earn/referral": Gift,
  "/earn/creator": Users,
  "/creator/dashboard": LayoutDashboard,
  "/creator/videos": Video,
  "/creator/campaigns": Megaphone,
  "/creator/analytics/audience": BarChart3,
  "/creator/wallet": Wallet,
  "/creator/topup": Gift,
  "/admin/dashboard": ShieldCheck,
  "/admin/users": UserCog,
  "/admin/topups": Receipt,
  "/admin/withdrawals": Wallet,
  "/admin/audit": Settings,
};

interface SidebarProps {
  type: SidebarType;
}

export function Sidebar({ type }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const nav =
    type === "earner"
      ? site.nav.earn
      : type === "creator"
        ? site.nav.creator
        : site.nav.admin;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky top-0 hidden h-dvh flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground md:flex"
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-gradient">{site.name}</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-1.5 hover:bg-sidebar-accent"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {nav.map((item) => {
            const Icon = ICONS[item.href] || ListTodo;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence initial={false}>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section: Help, Settings, Logout */}
      <div className="border-t border-sidebar-border p-2">
        <ul className="space-y-1">
          {[
            { label: "Help Centre", href: `/${type}/help`, icon: HelpCircle },
            { label: "Settings", href: `/${type}/settings`, icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
          
          {/* Logout Button */}
          <li>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                title={collapsed ? "Log Out" : undefined}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Log Out</span>}
              </button>
            </form>
          </li>
        </ul>
      </div>
    </motion.aside>
  );
}