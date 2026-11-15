// src/app/creator/videos/new/add-video-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddVideoForm({ niches }: { niches: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [nicheId, setNicheId] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("creator_videos").insert({
      user_id: user.id,
      title,
      video_url: url,
      description,
      thumbnail_url: thumbnailUrl,
      niche_id: parseInt(nicheId),
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Video added successfully!");
      router.push("/creator/videos");
    }
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Video Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">TikTok Video URL</Label>
        <Input id="url" placeholder="https://tiktok.com/@user/video/123" value={url} onChange={(e) => setUrl(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnail">Thumbnail URL</Label>
        <Input id="thumbnail" placeholder="https://example.com/image.jpg" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="niche">Niche</Label>
        <Select value={nicheId} onValueChange={setNicheId} required>
          <SelectTrigger><SelectValue placeholder="Select niche" /></SelectTrigger>
          <SelectContent>
            {niches.map((n) => <SelectItem key={n.id} value={n.id.toString()}>{n.name}</SelectItem>)}
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
        {isLoading ? "Adding..." : "Add Video"}
      </Button>
    </form>
  );
}