// src/app/earn/earnings/withdrawal-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WithdrawalForm({ availableBalance, qualifiedReferrals }: { availableBalance: number; qualifiedReferrals: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralWarning, setShowReferralWarning] = useState(false);

  const minAmount = 500;
  const hasEnoughBalance = availableBalance >= minAmount;
  const hasEnoughReferrals = qualifiedReferrals >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // If they don't have enough balance, stop them.
    if (!hasEnoughBalance) {
      toast.error(`You need at least ${minAmount} credits to withdraw.`);
      return;
    }

    // If they are trying to submit but have no referrals, show the warning UI
    if (!hasEnoughReferrals) {
      setShowReferralWarning(true);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const requestedAmount = parseInt(amount);
    if (requestedAmount > availableBalance) {
      toast.error("Amount exceeds available balance.");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: user.id,
      amount: requestedAmount,
      qualified_referrals: qualifiedReferrals,
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Withdrawal request submitted successfully!");
      router.push("/earn/dashboard");
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Balance</span>
          <span className="text-2xl font-bold">{availableBalance.toLocaleString()} credits</span>
        </div>
      </div>

      {/* Only show if balance is insufficient */}
      {!hasEnoughBalance && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm border border-red-500/20">
          You need at least {minAmount} credits to request a withdrawal. Keep completing tasks!
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount to Withdraw</Label>
          <Input
            id="amount"
            type="number"
            placeholder={`Min ${minAmount}`}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              // Hide the warning if they change the amount
              if (showReferralWarning) setShowReferralWarning(false);
            }}
            min={minAmount}
            max={availableBalance}
            disabled={!hasEnoughBalance}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || !hasEnoughBalance}>
          {isLoading ? "Submitting..." : "Request Withdrawal"}
        </Button>
      </form>

      {/* Referral warning ONLY appears if they have the balance but try to submit without referrals */}
      {showReferralWarning && !hasEnoughReferrals && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm animate-in fade-in slide-in-from-top-2">
          <p className="font-semibold mb-1">Referral Requirement</p>
          <p className="mb-3">
            You need 5 qualified referrals before you can withdraw. You currently have:
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-2 bg-orange-500/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full" 
                style={{ width: `${Math.min((qualifiedReferrals / 5) * 100, 100)}%` }}
              />
            </div>
            <span className="font-bold">{qualifiedReferrals}/5</span>
          </div>
          <p className="text-xs">
            Invite {5 - qualifiedReferrals} more user{5 - qualifiedReferrals !== 1 ? 's' : ''} to unlock withdrawals.
          </p>
          <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => router.push('/earn/referral')}>
            Go to Referral Page
          </Button>
        </div>
      )}
    </div>
  );
}