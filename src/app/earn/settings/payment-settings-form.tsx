// src/app/earn/settings/payment-settings-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { savePaymentDetails } from "@/lib/services/settings";

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

    const paymentDetails = method === "mpesa" 
      ? { method: "mpesa", mpesa_number: mpesaNumber }
      : { method: "bank", bank_name: bankName, account_number: accountNumber };

    const result = await savePaymentDetails(paymentDetails);

    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Payment details saved successfully!");
      
      // 1. Refresh the current page's cache so the form shows the new data
      router.refresh();
      
      // 2. Hard reload to the earnings page to guarantee fresh state
      setTimeout(() => {
        window.location.href = "/earn/earnings";
      }, 500);
    }
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
          <Input placeholder="e.g. 0712345678" value={mpesaNumber} onChange={(e) => setMpesaNumber(e.target.value)} required />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input placeholder="e.g. Equity Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input placeholder="Your account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
          </div>
        </>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : initialDetails ? "Update Details" : "Save Details"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/earn/earnings")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}