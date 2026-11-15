// src/app/earn/rank/rank-upgrade-client.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Star, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function RankUpgradeClient({ 
  ranks, 
  paybill, 
  account, 
  currentRankId 
}: { 
  ranks: any[], 
  paybill: string, 
  account: string,
  currentRankId: number 
}) {
  const [selectedRank, setSelectedRank] = useState<any>(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const paymentRef = useRef<HTMLDivElement>(null);

  function handleRankSelect(rank: any) {
    // Prevent selecting a rank that is lower or equal to current
    if (rank.id <= currentRankId) {
      toast.error("You already have this rank or higher.");
      return;
    }
    
    setSelectedRank(rank);
    setTimeout(() => {
      paymentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRank) return;

    const codeRegex = /^[A-Z0-9]{10}$/i;
    if (!codeRegex.test(mpesaCode)) {
      toast.error("Invalid M-Pesa code. It must be exactly 10 characters.");
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // The RPC function will now overwrite the existing rank due to ON CONFLICT
    const { error } = await supabase.rpc("request_rank_upgrade", {
      p_user_id: user.id,
      p_rank_id: selectedRank.id,
      p_mpesa_code: mpesaCode.toUpperCase(),
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Upgrade request submitted! Awaiting admin approval.");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranks.map((rank) => {
          const isLocked = rank.id <= currentRankId;
          
          return (
            <Card
              key={rank.id}
              onClick={() => handleRankSelect(rank)}
              className={`p-6 transition-all ${
                isLocked 
                  ? "opacity-50 cursor-not-allowed bg-secondary/20" 
                  : "cursor-pointer hover:border-primary/50"
              } ${selectedRank?.id === rank.id ? "border-primary shadow-glow scale-105" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {Array.from({ length: rank.stars }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${isLocked ? "text-muted-foreground" : "text-primary fill-primary"}`} />
                  ))}
                </div>
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <h3 className="text-lg font-bold">{rank.name}</h3>
              <p className="text-2xl font-extrabold mt-2 text-primary">Ksh {rank.tier_value.toLocaleString()}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {rank.daily_follow_tasks} Follows / day</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> {rank.daily_like_tasks} Likes / day</li>
              </ul>
            </Card>
          );
        })}
      </div>

      {selectedRank && (
        <div ref={paymentRef} className="glass rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Pay for {selectedRank.name}</h2>
            <p className="text-sm text-muted-foreground">Complete the M-Pesa payment to upgrade your account.</p>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Payment Instructions:</p>
            <p className="text-muted-foreground">
              Paybill Number: <span className="font-semibold text-foreground">{paybill}</span><br />
              Account Number: <span className="font-semibold text-foreground">{account}</span><br />
              Amount: <span className="font-semibold text-foreground">Ksh {selectedRank.tier_value}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mpesa">M-Pesa Transaction Code</Label>
              <Input
                id="mpesa"
                placeholder="e.g. QWE123RTY4"
                value={mpesaCode}
                onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                maxLength={10}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Upgrade Request"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}