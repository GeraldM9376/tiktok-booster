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
  X,
} from "lucide-react";

import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/actions";
import { Logo } from "@/components/brand/logo";

type SidebarType = "earner" | "creator" | "admin";

const ICONS: Record<string, React.ElementType> = {
  "/earn/dashboard": LayoutDashboard,
  "/earn/marketplace": Compass,
  "/earn/tasks/daily": ListTodo,
  "/earn/earnings": Wallet,
  "/earn/rank": Trophy,
  "/earn/referral": Gift,
  "/earn/payment-settings": Settings,
  "/earn/help": HelpCircle,
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
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ type, isOpen, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const nav =
    type === "earner"
      ? site.nav.earn
      : type === "creator"
        ? site.nav.creator
        : site.nav.admin;

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between px-4">
        {(!collapsed || isOpen) && (
          <div onClick={onClose}>
            <Logo collapsed={collapsed} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:block rounded-md p-1.5 hover:bg-sidebar-accent"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={onClose}
          className="md:hidden rounded-md p-1.5 hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
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
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <ul className="space-y-1">
          <li>
            <Link
              href={`/${type}/help`}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                pathname === `/${type}/help`
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              <span>Help Centre</span>
            </Link>
          </li>
          <li>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Log Out</span>
              </button>
            </form>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="sticky top-0 hidden h-dvh flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground md:flex"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}