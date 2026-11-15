// src/components/brand/logo.tsx
import { Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  collapsed?: boolean;
}

export function Logo({ className, href = "/", collapsed = false }: LogoProps) {
  return (
    <Link 
      href={href} 
      className={cn(
        "group flex items-center gap-2 transition-opacity hover:opacity-90", 
        collapsed && "justify-center",
        className
      )}
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-accent to-primary shadow-glow">
        <Rocket className="h-5 w-5 text-background transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      {!collapsed && (
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          TikTok <span className="text-gradient">Booster</span>
        </span>
      )}
    </Link>
  );
}