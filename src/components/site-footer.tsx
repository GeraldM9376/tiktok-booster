// src/components/site-footer.tsx
"use client";

import Link from "next/link";
import { site } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="mb-2">
              <Logo />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{site.tagline}</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/earn/auth" className="hover:text-foreground">Earn</Link>
            <Link href="/creator/auth" className="hover:text-foreground">Creator</Link>
            <Link href="/admin/auth" className="hover:text-foreground">Admin</Link>
          </nav>
        </div>

        <Separator className="my-6" />

        <p className="text-center text-[11px] text-muted-foreground">
          © {year ?? "2026"} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
