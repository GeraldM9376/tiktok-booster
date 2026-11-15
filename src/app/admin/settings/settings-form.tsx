// src/app/admin/settings/settings-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function SettingsForm({ initialPaybill, initialAccount }: { initialPaybill: string, initialAccount: string }) {
  const [paybill, setPaybill] = useState(initialPaybill);
  const [account, setAccount] = useState(initialAccount);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    
    // Update both settings atomically
    const { error: error1 } = await supabase
      .from("platform_settings")
      .update({ value: paybill, updated_at: new Date().toISOString() })
      .eq("key", "payment_paybill");

    const { error: error2 } = await supabase
      .from("platform_settings")
      .update({ value: account, updated_at: new Date().toISOString() })
      .eq("key", "payment_account");

    if (error1 || error2) {
      toast.error("Failed to save settings.");
    } else {
      toast.success("Settings saved successfully!");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="paybill">M-Pesa Paybill Number</Label>
        <Input
          id="paybill"
          value={paybill}
          onChange={(e) => setPaybill(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">This is shown on the payment instructions page.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account">M-Pesa Account Number</Label>
        <Input
          id="account"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          required
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}