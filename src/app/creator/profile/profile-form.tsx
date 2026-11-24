
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProfileForm({
  initialData,
  niches,
}: {
  initialData: any;
  niches: any[];
}) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
    initialData?.tiktok_username || ""
  );
  const [tiktokUrl, setTiktokUrl] = useState(
    initialData?.tiktok_url || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    initialData?.avatar_url || ""
  );
  const [bio, setBio] = useState(initialData?.bio || "");
  const [nicheId, setNicheId] = useState(
    initialData?.niche_id?.toString() || ""
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!nicheId) {
      toast.error("Please select your primary niche.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Your session has expired. Please sign in again.");
        return;
      }

      const { error } = await supabase.rpc("update_creator_profile", {
        p_tiktok_username: tiktokUsername.trim(),
        p_tiktok_url: tiktokUrl.trim(),
        p_avatar_url: avatarUrl.trim() || null,
        p_bio: bio.trim(),
        p_niche_id: Number(nicheId),
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Creator profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Creator profile update failed:", error);
      toast.error("Something went wrong while saving your profile.");
    } finally {
      setIsLoading(false);
    }
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
        <p className="text-xs text-muted-foreground">
          Enter your username without the @ symbol.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tiktok_url">TikTok Profile URL</Label>
        <div className="flex gap-2">
          <Input
            id="tiktok_url"
            type="url"
            placeholder="https://www.tiktok.com/@username"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            required
          />
          {tiktokUrl && (
            <Button type="button" variant="outline" asChild>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Test Link
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatar_url">Profile Picture URL</Label>
        <Input
          id="avatar_url"
          type="url"
          placeholder="https://example.com/your-photo.jpg"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Optional. Use a publicly accessible image URL.
        </p>
        {avatarUrl && (
          <div className="flex items-center gap-3 pt-2">
            <img
              src={avatarUrl}
              alt="Profile preview"
              className="h-14 w-14 rounded-full border object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-xs text-muted-foreground">
              Profile picture preview
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="niche">Primary Niche</Label>
        <Select
          value={nicheId}
          onValueChange={setNicheId}
          required
        >
          <SelectTrigger id="niche">
            <SelectValue placeholder="Select your niche" />
          </SelectTrigger>
          <SelectContent>
            {niches.map((n) => (
              <SelectItem key={n.id} value={n.id.toString()}>
                {n.name}
              </SelectItem>
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
