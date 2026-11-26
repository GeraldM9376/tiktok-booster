
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TopupPackage = {
  id: number;
  name: string;
  credits: number;
  price_label: string;
  description?: string | null;
  features?: string[] | null;
};

type TopupHistory = {
  id: string;
  package_id: number;
  requested_credits: number;
  transaction_reference: string;
  status: string;
  admin_comment: string | null;
  created_at: string;
  topup_packages:
    | { name: string; price_label: string }
    | { name: string; price_label: string }[]
    | null;
};

export function TopupForm({
  packages,
  paymentSettings,
  history,
}: {
  packages: TopupPackage[];
  paymentSettings: {
    paybill: string;
    account: string;
  };
  history: TopupHistory[];
}) {
  const router = useRouter();

  const [selectedPackage, setSelectedPackage] =
    useState<TopupPackage | null>(null);
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const paymentAvailable =
    !!paymentSettings.paybill &&
    !!paymentSettings.account &&
    !/maintenance|unavailable|disabled/i.test(paymentSettings.paybill);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPackage) {
      toast.error("Please select a top-up package.");
      return;
    }

    if (!paymentAvailable) {
      toast.error("M-Pesa top-ups are currently unavailable.");
      return;
    }

    const cleanReference = reference.trim().toUpperCase();

    if (!cleanReference) {
      toast.error("Enter your M-Pesa transaction reference.");
      return;
    }

    if (!/^[A-Z0-9]{8,20}$/.test(cleanReference)) {
      toast.error("Enter a valid M-Pesa transaction reference.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        toast.error("Your session has expired. Please sign in again.");
        router.push("/creator/auth");
        return;
      }

      const { error } = await supabase
        .from("topup_requests")
        .insert({
          user_id: user.id,
          package_id: selectedPackage.id,
          requested_credits: selectedPackage.credits,
          transaction_reference: cleanReference,
          status: "pending",
        });

      if (error) {
        if (error.code === "23505") {
          toast.error(
            "This M-Pesa transaction reference has already been submitted."
          );
          return;
        }

        console.error("Top-up submission failed:", error);
        toast.error(`Submission failed: ${error.message}`);
        return;
      }

      toast.success(
        "Top-up request submitted successfully. Your payment is awaiting approval that may take up to 24 hours."
      );

      setReference("");
      setSelectedPackage(null);
      router.refresh();
    } catch (error) {
      console.error("Top-up submission error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while submitting your request."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function getPackageDetails(item: TopupHistory) {
    return Array.isArray(item.topup_packages)
      ? item.topup_packages[0]
      : item.topup_packages;
  }

  function statusClass(status: string) {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500/10 text-green-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-yellow-500/10 text-yellow-600";
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Choose a Credit Package</h2>
          <p className="text-sm text-muted-foreground">
            Select the package that suits your campaign budget.
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="rounded-xl border p-6 text-center">
            No active top-up packages are currently available.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer p-6 transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "border-primary shadow-glow scale-[1.02]"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <h3 className="text-lg font-bold">{pkg.name}</h3>

                <p className="mt-2 text-3xl font-extrabold text-primary">
                  {Number(pkg.credits).toLocaleString("en-KE")}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  credits
                </p>

                <p className="mt-4 text-lg font-bold">
                  KSh {pkg.price_label}
                </p>

                {pkg.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                )}

                <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                  {pkg.features?.map((feature, index) => (
                    <li key={`${pkg.id}-${index}`}>• {feature}</li>
                  ))}
                </ul>

                <p className="mt-4 text-xs font-semibold text-primary">
                  {selectedPackage?.id === pkg.id
                    ? "Selected"
                    : "Select package"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selectedPackage && (
        <section className="glass space-y-6 rounded-xl p-6">
          <div>
            <h2 className="text-xl font-bold">Checkout</h2>
            <p className="text-sm text-muted-foreground">
              Pay using the official payment instructions below.
            </p>
          </div>

          {!paymentAvailable ? (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                M-Pesa top-ups are currently unavailable.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Payment instructions are being updated. Please try again
                later.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-secondary/50 p-4 text-sm">
                <p className="mb-3 font-medium">Payment Instructions</p>

                <p className="text-muted-foreground">
                  Paybill:{" "}
                  <span className="font-semibold text-foreground">
                    {paymentSettings.paybill}
                  </span>
                </p>

                <p className="mt-2 text-muted-foreground">
                  Account:{" "}
                  <span className="font-semibold text-foreground">
                    {paymentSettings.account}
                  </span>
                </p>

                <p className="mt-2 text-muted-foreground">
                  Amount:{" "}
                  <span className="font-semibold text-foreground">
                    KSh {selectedPackage.price_label}
                  </span>
                </p>

                <p className="mt-2 text-muted-foreground">
                  Credits:{" "}
                  <span className="font-semibold text-foreground">
                    {selectedPackage.credits.toLocaleString("en-KE")}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">
                    M-Pesa Transaction Reference
                  </Label>

                  <Input
                    id="reference"
                    placeholder="e.g. QWE123RTY"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                    maxLength={20}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !reference.trim()}
                >
                  {isLoading ? "Submitting..." : "Submit for Approval"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Credits are added only after Admin verifies and approves
                  your payment.
                </p>
              </form>
            </>
          )}
        </section>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">My Top-up History</h2>
          <p className="text-sm text-muted-foreground">
            Track your previous credit purchase requests.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            You haven't submitted any top-up requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const pkg = getPackageDetails(item);

              return (
                <Card key={item.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {pkg?.name || "Credit package"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleString("en-KE")}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Amount
                      </p>
                      <p className="font-semibold">
                        KSh {pkg?.price_label || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Credits
                      </p>
                      <p className="font-semibold">
                        {item.requested_credits.toLocaleString("en-KE")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        M-Pesa Reference
                      </p>
                      <p className="break-all font-semibold">
                        {item.transaction_reference}
                      </p>
                    </div>
                  </div>

                  {item.admin_comment && (
                    <div className="rounded-md bg-secondary/50 p-3 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Admin Comment
                      </p>
                      <p className="mt-1">{item.admin_comment}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
