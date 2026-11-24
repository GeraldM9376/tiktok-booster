import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Loader2, Wallet, Clock, TrendingUp, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function WalletContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/creator/auth");

  const [{ data: wallet }, { data: transactions, error }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("wallet_transactions")
      .select("id, amount, type, status, description, created_at, balance_after")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (error) console.error("Wallet transactions error:", error);

  const money = (value: number | null | undefined) =>
    Number(value ?? 0).toLocaleString("en-KE");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View your creator credits and transaction history.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Available Balance", value: wallet?.available_balance, icon: Wallet },
          { title: "Pending Balance", value: wallet?.pending_balance, icon: Clock },
          { title: "Lifetime Earned", value: wallet?.lifetime_earned, icon: TrendingUp },
          { title: "Referral Earned", value: wallet?.referral_earned, icon: Gift },
        ].map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{money(item.value)} credits</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No transactions found.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {transaction.description || transaction.type.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleString("en-KE")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.status}
                    </p>
                  </div>
                  <p className={`font-semibold ${Number(transaction.amount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {Number(transaction.amount) > 0 ? "+" : ""}
                    {money(transaction.amount)} credits
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreatorWalletPage() {
  return (
    <DashboardShell type="creator" authPath="/creator/auth">
      <Suspense fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <WalletContent />
      </Suspense>
    </DashboardShell>
  );
}
