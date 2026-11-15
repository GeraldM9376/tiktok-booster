// src/components/brand/logo.tsx
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
      <div className="relative flex h-8 w-8 items-center justify-center">
        {/* Official TikTok Logo SVG with Cyan/Red accents */}
        <svg 
          viewBox="0 0 448 512" 
          className="h-7 w-7 transition-transform group-hover:scale-105"
          fill="currentColor"
        >
          <path 
            fill="#25F4EE" 
            d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" 
          />
          <path 
            fill="#FE2C55" 
            d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" 
            style={{ mixBlendMode: 'screen', opacity: 0.9 }}
          />
        </svg>
      </div>
      {!collapsed && (
        <span className="text-xl font-extrabold tracking-tight text-foreground">
          TikTok <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]">Booster</span>
        </span>
      )}
    </Link>
  );
}