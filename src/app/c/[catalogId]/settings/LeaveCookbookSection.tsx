"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { leaveCatalog } from "./actions";

interface LeaveCookbookSectionProps {
  catalogId: string;
  catalogName: string;
}

export function LeaveCookbookSection({
  catalogId,
  catalogName,
}: LeaveCookbookSectionProps) {
  const [working, setWorking] = useState(false);

  async function onLeave() {
    if (
      !confirm(
        `Leave ${catalogName}? You'll lose access to it unless someone invites you back.`,
      )
    ) {
      return;
    }
    setWorking(true);
    const result = await leaveCatalog({ catalog_id: catalogId });
    setWorking(false);
    if (result && !result.ok) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="pt-6">
        <h2 className="font-serif text-2xl text-foreground">Leave cookbook</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Remove yourself from {catalogName}. You can rejoin later if someone
          shares the invite link again.
        </p>
        <Button
          variant="outline"
          className="mt-5"
          onClick={onLeave}
          disabled={working}
        >
          {working ? "Leaving…" : "Leave cookbook"}
        </Button>
      </CardContent>
    </Card>
  );
}
