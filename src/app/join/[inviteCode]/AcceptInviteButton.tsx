"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { acceptInvite } from "./actions";

export function AcceptInviteButton({ inviteCode }: { inviteCode: string }) {
  const [working, setWorking] = useState(false);

  async function onClick() {
    setWorking(true);
    const result = await acceptInvite({ invite_code: inviteCode });
    setWorking(false);
    if (result && !result.ok) {
      toast.error(result.error);
    }
  }

  return (
    <Button size="lg" onClick={onClick} disabled={working}>
      {working ? "Joining…" : "Join cookbook"}
    </Button>
  );
}
