
"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Palette,
  ShieldCheck,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreatorSettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, startSaving] = useTransition();
  const [passwordSaving, startPasswordSaving] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !user) {
        router.replace("/creator/auth");
        return;
      }

      setEmail(user.email || "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        toast.error("Could not load your account details.");
      } else {
        setDisplayName(profile?.display_name || "");
      }

      setLoading(false);
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  function saveDisplayName() {
    startSaving(async () => {
      const name = displayName.trim();

      if (!name) {
        toast.error("Display name cannot be empty.");
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Your session has expired. Please sign in again.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Display name updated.");
      router.refresh();
    });
  }

  function changeEmail() {
    startSaving(async () => {
      const value = newEmail.trim().toLowerCase();

      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        toast.error("Enter a valid email address.");
        return;
      }

      if (value === email.toLowerCase()) {
        toast.error("This is already your current email.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: value,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setNewEmail("");
      toast.success("Email change requested. Check your inbox to confirm the new address.");
    });
  }

  function changePassword() {
    startPasswordSaving(async () => {
      if (currentPassword.length < 6) {
        toast.error("Enter your current password.");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("New password must contain at least 8 characters.");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        toast.error("Your current password is incorrect.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully.");
    });
  }

  async function signOutEverywhere() {
    const { error } = await supabase.auth.signOut({
      scope: "global",
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      
    );
  }

  return (
    
      <div className="mx-auto max-w-4xl space-y-6 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account details, password, appearance and security.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Account Details
            </CardTitle>
            <CardDescription>
              Update the name displayed on your Creator account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                placeholder="Your display name"
              />
            </div>
            <Button onClick={saveDisplayName} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Display Name
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Email Address
            </CardTitle>
            <CardDescription>
              Your current email is used to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email"
              />
            </div>
            <Button variant="outline" onClick={changeEmail} disabled={saving}>
              Request Email Change
            </Button>
            <p className="text-xs text-muted-foreground">
              Supabase may require confirmation from your current and new email addresses.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
            <CardDescription>
              Verify your current password before setting a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={changePassword} disabled={passwordSaving}>
              {passwordSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Update Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Appearance
            </CardTitle>
            <CardDescription>
              Choose how TikTok Booster looks on this device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme || "dark"}
                onValueChange={setTheme}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Security
            </CardTitle>
            <CardDescription>
              Manage your active sign-in sessions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <form action={signOut}>
              <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </form>
            <Button variant="destructive" onClick={signOutEverywhere}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Sign Out All Devices
            </Button>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">
          To update your TikTok username, profile link, picture, bio or niche,
          visit <a className="text-primary underline" href="/creator/profile">Profile Settings</a>.
        </p>
      </div>
    
  );
}

