
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

type AddVideoFormProps = {
  niches: any[];
  hasCreatorProfile: boolean;
};

export function AddVideoForm({
  niches,
  hasCreatorProfile,
}: AddVideoFormProps) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  // TikTok Creator profile details
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [tiktokProfileUrl, setTiktokProfileUrl] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  // Video details
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [nicheId, setNicheId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Please log in again to submit your video.");
        return;
      }

      if (!nicheId) {
        toast.error("Please select a niche.");
        return;
      }

      if (!hasCreatorProfile) {
        if (
          !tiktokUsername.trim() ||
          !tiktokProfileUrl.trim() ||
          !profilePictureUrl.trim()
        ) {
          toast.error("Please complete all TikTok profile details.");
          return;
        }
      }

      const { data, error } = await supabase.rpc(
        "submit_creator_video",
        {
          p_tiktok_username: hasCreatorProfile
            ? null
            : tiktokUsername.trim(),

          p_tiktok_profile_url: hasCreatorProfile
            ? null
            : tiktokProfileUrl.trim(),

          p_profile_picture_url: hasCreatorProfile
            ? null
            : profilePictureUrl.trim(),

          p_title: title.trim(),
          p_video_url: url.trim(),
          p_description: description.trim() || null,
          p_thumbnail_url: thumbnailUrl.trim() || null,
          p_niche_id: Number(nicheId),
        }
      );

      if (error) {
        toast.error(error.message || "Unable to submit video.");
        return;
      }

      if (!data?.success) {
        toast.error("Video submission was not completed.");
        return;
      }

      toast.success("Video and Creator profile submitted successfully!");

      router.push("/creator/videos");
      router.refresh();
    } catch (error) {
      console.error("Video submission error:", error);
      toast.error("Something went wrong while submitting your video.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {!hasCreatorProfile && (
        <div className="space-y-5 rounded-lg border border-border p-4">
          <div>
            <h2 className="text-lg font-semibold">
              TikTok Creator Profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These details create your public Creator marketplace profile.
              You only need to provide them once.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokUsername">
              TikTok Username
            </Label>
            <Input
              id="tiktokUsername"
              placeholder="@yourusername"
              value={tiktokUsername}
              onChange={(e) => setTiktokUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktokProfileUrl">
              TikTok Account/Profile URL
            </Label>
            <Input
              id="tiktokProfileUrl"
              type="url"
              placeholder="https://www.tiktok.com/@yourusername"
              value={tiktokProfileUrl}
              onChange={(e) => setTiktokProfileUrl(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profilePictureUrl">
              Profile Picture URL
            </Label>
            <Input
              id="profilePictureUrl"
              type="url"
              placeholder="https://example.com/profile-picture.jpg"
              value={profilePictureUrl}
              onChange={(e) => setProfilePictureUrl(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Video Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">TikTok Video URL</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://www.tiktok.com/@user/video/123"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input
          id="thumbnail"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="niche">Niche</Label>
        <Select
          value={nicheId}
          onValueChange={setNicheId}
          required
        >
          <SelectTrigger id="niche">
            <SelectValue placeholder="Select niche" />
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
        <Label htmlFor="desc">Description</Label>
        <textarea
          id="desc"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting..." : "Add Video"}
      </Button>
    </form>
  );
}
