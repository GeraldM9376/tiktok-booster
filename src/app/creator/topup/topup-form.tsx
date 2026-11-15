// src/app/creator/topup/topup-form.tsx
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPackage) return;
    setIsLoading(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("topup_requests").insert({
      user_id: user.id,
      package_id: selectedPackage.id,
      requested_credits: selectedPackage.credits,
      transaction_reference: reference,
      status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Top-up request submitted successfully! Awaiting admin approval.");
      router.push("/creator/dashboard");
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Package Selection */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`p-6 cursor-pointer transition-all ${
              selectedPackage?.id === pkg.id ? "border-primary shadow-glow scale-105" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedPackage(pkg)}
          >
            <h3 className="text-lg font-bold">{pkg.name}</h3>
            <p className="text-3xl font-extrabold mt-2 text-primary">{pkg.credits.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-1">credits</p>
            <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
              {pkg.features?.map((f: string) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Payment Form (only if selected) */}
      {selectedPackage && (
        <div className="glass rounded-xl p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold">Checkout</h2>
            <p className="text-sm text-muted-foreground">
              Complete your payment and enter the transaction reference below.
            </p>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Payment Instructions:</p>
            <p className="text-muted-foreground">
              Send payment to <span className="font-semibold text-foreground">Paybill: 123456</span><br />
              Account: <span className="font-semibold text-foreground">TIKTOKBOOSTER</span><br />
              Amount: <span className="font-semibold text-foreground">Ksh {selectedPackage.credits}</span>
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
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}