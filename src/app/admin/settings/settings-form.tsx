
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
  initialSupportEmail: string;
  initialSupportWhatsApp: string;
};

export function SettingsForm({
  initialPaybill,
  initialAccount,
  initialSupportEmail,
  initialSupportWhatsApp,
}: SettingsFormProps) {
  const [paybill, setPaybill] = useState(initialPaybill);
  const [account, setAccount] = useState(initialAccount);
  const [supportEmail, setSupportEmail] = useState(initialSupportEmail);
  const [supportWhatsApp, setSupportWhatsApp] = useState(initialSupportWhatsApp);
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [isSavingSupport, setIsSavingSupport] = useState(false);
  const router = useRouter();

  async function handleSavePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanPaybill = paybill.trim();
    const cleanAccount = account.trim();

    if (!cleanPaybill || !cleanAccount) {
      toast.error("Both payment fields are required.");
      return;
    }

    setIsSavingPayment(true);

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

      toast.success("Payment settings saved successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save payment settings."
      );
    } finally {
      setIsSavingPayment(false);
    }
  }

  async function handleSaveSupport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = supportEmail.trim();
    const cleanWhatsApp = supportWhatsApp.trim();

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Enter a valid support email address.");
      return;
    }

    if (cleanWhatsApp && !/^\+?[0-9\s()-]{7,20}$/.test(cleanWhatsApp)) {
      toast.error("Enter a valid WhatsApp number with country code.");
      return;
    }

    setIsSavingSupport(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.rpc("update_support_settings", {
        p_support_email: cleanEmail,
        p_support_whatsapp: cleanWhatsApp,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Support contacts saved successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save support contacts."
      );
    } finally {
      setIsSavingSupport(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSavePayment} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Payment Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure the M-Pesa payment instructions shown to users.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paybill">M-Pesa Paybill Number</Label>
          <Input
            id="paybill"
            value={paybill}
            onChange={(e) => setPaybill(e.target.value)}
            placeholder="Enter Paybill number"
            required
            disabled={isSavingPayment}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="account">M-Pesa Account Number</Label>
          <Input
            id="account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="Enter account number"
            required
            disabled={isSavingPayment}
          />
        </div>

        <Button type="submit" disabled={isSavingPayment}>
          {isSavingPayment ? "Saving..." : "Save Payment Settings"}
        </Button>
      </form>

      <div className="border-t" />

      <form onSubmit={handleSaveSupport} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Creator Support Contacts</h2>
          <p className="text-sm text-muted-foreground">
            These contacts appear in the Creator Help Centre. Leave a field
            empty to hide that contact option.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-email">Support Email</Label>
          <Input
            id="support-email"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="support@example.com"
            disabled={isSavingSupport}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="support-whatsapp">Support WhatsApp Number</Label>
          <Input
            id="support-whatsapp"
            value={supportWhatsApp}
            onChange={(e) => setSupportWhatsApp(e.target.value)}
            placeholder="+2547XXXXXXXX"
            disabled={isSavingSupport}
          />
        </div>

        <Button type="submit" disabled={isSavingSupport}>
          {isSavingSupport ? "Saving..." : "Save Support Contacts"}
        </Button>
      </form>
    </div>
  );
}
