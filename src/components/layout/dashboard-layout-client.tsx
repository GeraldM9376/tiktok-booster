"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  type: "earner" | "creator" | "admin";
  userEmail: string;
  displayName: string | null;
  avatarUrl: string | null;
  walletBalance?: number;
  walletLabel: string;
}

export function DashboardLayoutClient({
  children,
  type,
  userEmail,
  displayName,
  avatarUrl,
  walletBalance,
  walletLabel,
}: DashboardLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        type={type}
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col">
        <Topbar
          userEmail={userEmail}
          displayName={displayName}
          avatarUrl={avatarUrl}
          walletBalance={walletBalance}
          walletLabel={walletLabel}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
