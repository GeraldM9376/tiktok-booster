// src/app/earn/settings/payment-settings-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";

export function PaymentSettingsForm({ initialDetails }: { initialDetails: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState(initialDetails?.method || "mpesa");
  const [mpesaNumber, setMpesaNumber] = useState(initialDetails?.mpesa_number || "");
  const [bankName, setBankName] = useState(initialDetails?.bank_name || "");
  const [accountNumber, setAccountNumber] = useState(initialDetails?.account_number || "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const paymentDetails = method === "mpesa" 
      ? { method: "mpesa", mpesa_number: mpesaNumber }
      : { method: "bank", bank_name: bankName, account_number: accountNumber };

    const { error } = await supabase
      .from("earner_profiles")
      .update({ payment_details: paymentDetails })
      .eq("user_id", user.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Payment details saved!");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mpesa">M-Pesa</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === "mpesa" ? (
        <div className="space-y-2">
          <Label>M-Pesa Phone Number</Label>
          <Input 
            placeholder="e.g. 0712345678" 
            value={mpesaNumber} 
            onChange={(e) => setMpesaNumber(e.target.value)} 
            required 
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input 
              placeholder="e.g. Equity Bank" 
              value={bankName} 
              onChange={(e) => setBankName(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input 
              placeholder="Your account number" 
              value={accountNumber} 
              onChange={(e) => setAccountNumber(e.target.value)} 
              required 
            />
          </div>
        </>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Payment Details"}
      </Button>
    </form>
  );
}