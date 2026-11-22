
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Wallet, CheckCircle2 } from "lucide-react";

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
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReferralRequirement, setShowReferralRequirement] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const pendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (requestSubmitted) {
      pendingRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [requestSubmitted]);

  const numericAmount = Number(amount);
  const canEnterAmount = hasPaymentDetails && availableBalance >= 500;

  const formattedAmount = amount
    ? Number(amount).toLocaleString("en-KE")
    : "";

  async function handleWithdrawal() {
    if (isLoading || requestSubmitted) return;

    if (!hasPaymentDetails) {
      toast.error("Please save your payment details first.");
      return;
    }

    if (availableBalance < 500) {
      toast.error("You need at least KSh 500 to withdraw.");
      return;
    }

    if (!amount || !Number.isSafeInteger(numericAmount) || numericAmount < 500) {
      toast.error("Enter a valid amount of at least KSh 500.");
      return;
    }

    if (numericAmount > availableBalance) {
      toast.error("Your withdrawal amount exceeds your available balance.");
      return;
    }

    // Reveal referral information only after the user requests withdrawal.
    setShowReferralRequirement(true);

    if (qualifiedReferrals < requiredReferrals) {
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
        p_amount: numericAmount,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setRequestSubmitted(true);
      setAmount("");
      setShowReferralRequirement(false);

      toast.success("Withdrawal request submitted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {requestSubmitted && (
        <div
          ref={pendingRef}
          role="status"
          className="flex items-start gap-3 border-b border-green-500/20 bg-green-500/10 p-5 text-green-700"
        >
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <h2 className="text-lg font-bold">Approval Pending</h2>
            <p className="mt-1 text-sm">
              Your withdrawal request has been submitted successfully.
              Please allow up to 24 hours for approval.
            </p>
          </div>
        </div>
      )}

      <div className="border-b bg-muted/30 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold">Request a Withdrawal</h2>
            <p className="text-sm text-muted-foreground">
              Withdraw your available earnings.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="rounded-xl border bg-background p-4">
          <p className="text-sm text-muted-foreground">Available balance</p>
          <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums">
            KSh {Number(availableBalance).toLocaleString("en-KE")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimum withdrawal: KSh 500
          </p>
        </div>

        {!hasPaymentDetails ? (
          <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Save your payment details above before entering a withdrawal
              amount.
            </p>
          </div>
        ) : availableBalance < 500 ? (
          <div className="flex items-start gap-3 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-600">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your balance is below the KSh 500 minimum. Continue earning until
              you reach the minimum withdrawal amount.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="withdrawal-amount"
              className="block text-sm font-semibold"
            >
              Amount to withdraw
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                KSh
              </span>

              <input
                id="withdrawal-amount"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={formattedAmount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                disabled={isLoading || requestSubmitted}
                className="h-14 w-full rounded-xl border bg-background pl-16 pr-4 text-lg font-semibold tabular-nums outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Enter a whole-number amount. Maximum available: KSh{" "}
              {Number(availableBalance).toLocaleString("en-KE")}.
            </p>
          </div>
        )}

        {!requestSubmitted && (
          <Button
            type="button"
            onClick={handleWithdrawal}
            disabled={isLoading || !canEnterAmount}
            className="h-12 w-full text-base font-semibold"
          >
            {isLoading ? "Submitting request..." : "Request Withdrawal"}
          </Button>
        )}

        {showReferralRequirement &&
          qualifiedReferrals < requiredReferrals &&
          !requestSubmitted && (
            <div className="space-y-3 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />

                <div>
                  <h3 className="font-semibold">
                    Referral requirement not yet met
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You have {qualifiedReferrals} approved{" "}
                    {qualifiedReferrals === 1 ? "referral" : "referrals"}.
                    You need {requiredReferrals} to withdraw.
                  </p>
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {requiredReferrals - qualifiedReferrals} more{" "}
                    {requiredReferrals - qualifiedReferrals === 1
                      ? "referral"
                      : "referrals"}{" "}
                    required.
                  </p>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/earn/referral">
                  Go to Referral Page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
