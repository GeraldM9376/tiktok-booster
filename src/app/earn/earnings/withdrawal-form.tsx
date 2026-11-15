// src/app/earn/earnings/withdrawal-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

export function WithdrawalForm({ 
  availableBalance, 
  qualifiedReferrals,
  hasPaymentDetails 
}: { 
  availableBalance: number; 
  qualifiedReferrals: number;
  hasPaymentDetails: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralWarning, setShowReferralWarning] = useState(false);

  const minAmount = 500;
  const hasEnoughBalance = availableBalance >= minAmount;
  const hasEnoughReferrals = qualifiedReferrals >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!hasEnoughBalance) {
      toast.error(`You need at least ${minAmount} credits to withdraw.`);
      return;
    }

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

      {!hasPaymentDetails && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Payment Details Missing</p>
            <p className="text-sm">You must set up your payment details in Settings before you can withdraw.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
              onClick={() => router.push("/earn/settings")}
            >
              Go to Settings
            </Button>
          </div>
        </div>
      )}

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
              if (showReferralWarning) setShowReferralWarning(false);
            }}
            min={minAmount}
            max={availableBalance}
            disabled={!hasEnoughBalance || !hasPaymentDetails}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !hasEnoughBalance || !hasPaymentDetails}
        >
          {isLoading ? "Submitting..." : "Request Withdrawal"}
        </Button>
      </form>

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