// src/app/creator/profile/profile-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProfileForm({ initialData, niches }: { initialData: any; niches: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(initialData?.tiktok_username || "");
  const [tiktokUrl, setTiktokUrl] = useState(initialData?.tiktok_url || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [nicheId, setNicheId] = useState(initialData?.niche_id?.toString() || "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("creator_profiles").upsert({
      user_id: user.id,
      tiktok_username: tiktokUsername,
      tiktok_url: tiktokUrl,
      bio: bio,
      niche_id: parseInt(nicheId),
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile saved successfully!");
      router.refresh();
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tiktok_username">TikTok Username</Label>
        <Input
          id="tiktok_username"
          placeholder="e.g. charlidamelio"
          value={tiktokUsername}
          onChange={(e) => setTiktokUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiktok_url">TikTok Profile URL</Label>
        <div className="flex gap-2">
          <Input
            id="tiktok_url"
            placeholder="https://tiktok.com/@username"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            required
          />
          {tiktokUrl && (
            <Button type="button" variant="outline" asChild>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer">Test Link</a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="niche">Primary Niche</Label>
        <Select value={nicheId} onValueChange={setNicheId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select your niche" />
          </SelectTrigger>
          <SelectContent>
            {niches.map((n) => (
              <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tell your audience about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}