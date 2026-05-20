"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, X, Loader2 } from "lucide-react";

interface PhotoUploaderProps {
  bucket: "dish-photos" | "original-cards";
  catalogId: string;
  recipeId: string;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  helpText?: string;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export function PhotoUploader({
  bucket,
  catalogId,
  recipeId,
  value,
  onChange,
  label,
  helpText,
}: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 10 MB.");
      return;
    }

    setUploading(true);
    const extFromName = file.name.split(".").pop()?.toLowerCase();
    const ext = extFromName && extFromName.length <= 5 ? extFromName : "jpg";
    const path = `${catalogId}/${recipeId}/${Date.now()}.${ext}`;

    const supabase = createClient();
    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false, contentType: file.type });
    if (error) {
      setUploading(false);
      toast.error(error.message);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      {label ? (
        <Label>
          {label}
          {helpText ? (
            <span className="text-muted-foreground font-normal">
              {" "}
              — {helpText}
            </span>
          ) : null}
        </Label>
      ) : null}

      {value ? (
        <div className="relative rounded-md overflow-hidden border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-80 object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
            Remove
          </Button>
        </div>
      ) : (
        <label className="block">
          <div className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:bg-muted/40 transition-colors">
            {uploading ? (
              <div className="flex flex-col items-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="mt-2 text-sm">Uploading…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground">
                <Camera className="size-6" />
                <span className="mt-2 text-sm text-foreground">
                  Tap to add a photo
                </span>
                <span className="text-xs mt-0.5">
                  JPG / PNG / HEIC up to 10 MB
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
          </div>
        </label>
      )}
    </div>
  );
}
