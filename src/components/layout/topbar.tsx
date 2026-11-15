// src/components/layout/topbar.tsx
"use client";

import { useTheme } from "next-themes";
import { Bell, Moon, Sun, LogOut, User, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/auth/actions";

interface TopbarProps {
  userEmail: string;
  displayName: string | null;
  avatarUrl: string | null;
  walletBalance?: number;
}

export function Topbar({ userEmail, displayName, avatarUrl, walletBalance }: TopbarProps) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const initials = (displayName || userEmail).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur px-4 md:px-6">
      <div className="flex-1" />

      {typeof walletBalance === "number" && (
        <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-sm md:flex">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-semibold">{walletBalance.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">credits</span>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={avatarUrl || undefined} alt={displayName || userEmail} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="text-sm font-medium">{displayName || "Account"}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <User className="mr-2 h-4 w-4" /> Account Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut}>
              <button type="submit" className="flex w-full items-center">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}