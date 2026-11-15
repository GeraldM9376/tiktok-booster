// src/app/earn/help/page.tsx
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, BookOpen, MessageCircle } from "lucide-react";

export default function EarnHelpPage() {
  return (
    <DashboardShell type="earner" authPath="/earn/auth">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Help Centre</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find answers to common questions and get support.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass p-6">
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Learn how to complete tasks and earn credits.</p>
          </Card>
          <Card className="glass p-6">
            <MessageCircle className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">FAQ</h3>
            <p className="text-sm text-muted-foreground">Common questions about ranks, withdrawals, and referrals.</p>
          </Card>
          <Card className="glass p-6">
            <Mail className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Contact Us</h3>
            <p className="text-sm text-muted-foreground">Email us at support@tiktok-booster.example</p>
          </Card>
        </div>

        <div className="glass rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">How to withdraw</h2>
          <p className="text-sm text-muted-foreground">1. Go to Payment Settings and save your M-Pesa or Bank details.</p>
          <p className="text-sm text-muted-foreground">2. Complete daily tasks to earn credits.</p>
          <p className="text-sm text-muted-foreground">3. Invite friends using your referral code to meet the referral requirement.</p>
          <p className="text-sm text-muted-foreground">4. Go to Withdrawals, enter the amount, and submit.</p>
        </div>
      </div>
    </DashboardShell>
  );
}