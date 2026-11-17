
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface WithdrawalFormProps {
  availableBalance: number;
  qualifiedReferrals: number;
  requiredReferrals: number;
  hasPaymentDetails: boolean;
}

export function WithdrawalForm({
  availableBalance,
  qualifiedReferrals,
  requiredReferrals,
  hasPaymentDetails,
}: WithdrawalFormProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleWithdrawal() {
    const requestedAmount = Number(amount);

    if (!Number.isSafeInteger(requestedAmount) || requestedAmount < 500) {
      toast.error("Minimum withdrawal is 500 credits.");
      return;
    }

    if (!hasPaymentDetails) {
      toast.error("Please save your payment details first.");
      return;
    }

    if (qualifiedReferrals < requiredReferrals) {
      toast.error("You have not met the referral requirement.");
      return;
    }

    if (requestedAmount > availableBalance) {
      toast.error("Insufficient wallet balance.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in again.");
        return;
      }

      const { error } = await supabase.rpc("request_withdrawal", {
        p_amount: requestedAmount,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Withdrawal request submitted successfully.");
      setAmount("");
      window.location.reload();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="withdrawal-amount"
          className="mb-2 block text-sm font-medium"
        >
          Withdrawal Amount
        </label>

        <input
          id="withdrawal-amount"
          type="number"
          min="500"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          disabled={isLoading}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Available balance: {availableBalance.toLocaleString()} credits
      </p>

      <p className="text-sm text-muted-foreground">
        Qualified referrals: {qualifiedReferrals} / {requiredReferrals}
      </p>

      <Button
        type="button"
        onClick={handleWithdrawal}
        disabled={
          isLoading ||
          !hasPaymentDetails ||
          qualifiedReferrals < requiredReferrals
        }
        className="w-full"
      >
        {isLoading ? "Submitting..." : "Request Withdrawal"}
      </Button>

      {!hasPaymentDetails && (
        <p className="text-sm text-destructive">
          Save your payment details before requesting a withdrawal.
        </p>
      )}
    </div>
  );
}
