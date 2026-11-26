"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteVideoButtonProps {
  videoId: string;
  videoTitle: string;
}

export function DeleteVideoButton({
  videoId,
  videoTitle,
}: DeleteVideoButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${videoTitle}"?\n\nIt will disappear from your videos and earning tasks. Completed engagement history and spent credits will be preserved.`
    );

    if (!confirmed || deleting) return;

    setDeleting(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "delete_creator_video",
        { p_video_id: videoId }
      );

      if (error) throw error;

      if (data && data.success === false) {
        throw new Error(data.message || "Video deletion failed.");
      }

      window.alert("Your video has been deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Delete video error:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "Could not delete this video. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      className="w-full"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="mr-2 h-4 w-4" />
      )}
      {deleting ? "Deleting..." : "Delete Video"}
    </Button>
  );
}
