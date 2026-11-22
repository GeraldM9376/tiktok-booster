
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TopupForm({ packages }: { packages: any[] }) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPackage) {
      toast.error("Please select a top-up package.");
      return;
    }

    const cleanReference = reference.trim().toUpperCase();

    if (!cleanReference) {
      toast.error("Enter your M-Pesa transaction reference.");
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
        console.error("Top-up submission failed:", error);
        toast.error(`Submission failed: ${error.message}`);
        return;
      }

      toast.success(
        "Top-up request submitted successfully. Awaiting admin approval."
      );

      setReference("");
      router.push("/creator/dashboard");
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

  return (
    <div className="space-y-8">
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
                  ? "border-primary shadow-glow scale-105"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              <h3 className="text-lg font-bold">{pkg.name}</h3>
              <p className="mt-2 text-3xl font-extrabold text-primary">
                {Number(pkg.credits).toLocaleString("en-KE")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">credits</p>

              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                {pkg.features?.map((feature: string) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {selectedPackage && (
        <div className="glass space-y-6 rounded-xl p-6">
          <div>
            <h2 className="text-xl font-bold">Checkout</h2>
            <p className="text-sm text-muted-foreground">
              Complete your payment and enter the transaction reference below.
            </p>
          </div>

          <div className="rounded-lg bg-secondary/50 p-4 text-sm">
            <p className="mb-2 font-medium">Payment Instructions:</p>
            <p className="text-muted-foreground">
              Send payment to{" "}
              <span className="font-semibold text-foreground">
                Paybill: 123456
              </span>
              <br />
              Account:{" "}
              <span className="font-semibold text-foreground">
                TIKTOKBOOSTER
              </span>
              <br />
              Amount:{" "}
              <span className="font-semibold text-foreground">
                Ksh {selectedPackage.credits}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reference">M-Pesa Transaction Reference</Label>
              <Input
                id="reference"
                placeholder="e.g. QWE123RTY"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !reference.trim()}
            >
              {isLoading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
