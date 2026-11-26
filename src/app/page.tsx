// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { Logo } from "@/components/brand/logo";

export default function Page() {
  return (
    <section className="bg-aurora relative flex min-h-[calc(100dvh-12rem)] items-center justify-center overflow-hidden px-6 py-20">
      <div className="mx-auto w-full max-w-3xl text-center">
        
        <div className="glass mx-auto mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {site.name} — Creator Growth Platform
        </div>

        <div className="mb-10 flex justify-center">
          <Logo className="scale-150" />
        </div>

        <h1 className="text-balance text-5xl font-extrabold tracking-tight md:text-6xl">
          <span className="text-gradient">Create. Connect Easily Globally. Grow Faster. Earn Bigger.</span>
        </h1>

        <p className="mt-4 text-lg text-muted-foreground md:text-xl">{site.tagline}</p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="shadow-glow">
            <Link href="/earn/auth">
              <Wallet className="mr-2 h-4 w-4" /> Start Earning
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="shadow-glow-purple">
            <Link href="/creator/auth">
              <TrendingUp className="mr-2 h-4 w-4" /> Grow My Account
            </Link>
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          <ArrowRight className="mr-1 inline h-3 w-3" />
          More features unlock as you grow.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active earners</p>
            <p className="mt-1 text-2xl font-bold">10,000+</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Niches</p>
            <p className="mt-1 text-2xl font-bold">20</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Ranks</p>
            <p className="mt-1 text-2xl font-bold">7</p>
          </div>
        </div>
      </div>
    </section>
  );
}