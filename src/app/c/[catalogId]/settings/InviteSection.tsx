"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Copy, RefreshCw, Check } from "lucide-react";
import { regenerateInviteCode } from "./actions";

interface InviteSectionProps {
  catalogId: string;
  inviteUrl: string;
}

export function InviteSection({ catalogId, inviteUrl }: InviteSectionProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Select and copy manually.");
    }
  }

  async function rotate() {
    if (
      !confirm(
        "Generate a new invite link? The current link will stop working.",
      )
    ) {
      return;
    }
    setRotating(true);
    const result = await regenerateInviteCode({ catalog_id: catalogId });
    setRotating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("New invite link generated");
    router.refresh();
  }

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="pt-6">
        <h2 className="font-serif text-2xl text-foreground">Invite link</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share this with the people you want to add. Anyone who opens it can
          join the cookbook as a contributor.
        </p>

        <div className="mt-5 space-y-2">
          <Label htmlFor="invite-url" className="sr-only">
            Invite URL
          </Label>
          <div className="flex gap-2">
            <Input
              id="invite-url"
              readOnly
              value={inviteUrl}
              className="font-mono text-sm"
              onFocus={(e) => e.currentTarget.select()}
            />
            <Button type="button" onClick={copyLink} variant="default">
              {copied ? (
                <>
                  <Check className="size-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={rotate}
            disabled={rotating}
          >
            <RefreshCw className="size-3.5" />
            {rotating ? "Generating…" : "Generate new link"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
