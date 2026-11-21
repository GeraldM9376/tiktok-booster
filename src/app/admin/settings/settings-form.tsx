
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type SettingsFormProps = {
  initialPaybill: string;
  initialAccount: string;
};

export function SettingsForm({
  initialPaybill,
  initialAccount,
}: SettingsFormProps) {
  const [paybill, setPaybill] = useState(initialPaybill);
  const [account, setAccount] = useState(initialAccount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanPaybill = paybill.trim();
    const cleanAccount = account.trim();

    if (!cleanPaybill || !cleanAccount) {
      toast.error("Both payment fields are required.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("update_payment_settings", {
        p_paybill: cleanPaybill,
        p_account: cleanAccount,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setPaybill(cleanPaybill);
      setAccount(cleanAccount);

      toast.success("Payment settings saved successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save payment settings."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="paybill">M-Pesa Paybill Number</Label>
        <Input
          id="paybill"
          value={paybill}
          onChange={(e) => setPaybill(e.target.value)}
          placeholder="Enter Paybill number"
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          This appears on the payment instructions page.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account">M-Pesa Account Number</Label>
        <Input
          id="account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Enter account number"
          required
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
