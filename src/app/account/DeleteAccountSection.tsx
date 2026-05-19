"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { deleteAccount } from "./actions";

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [working, setWorking] = useState(false);

  async function onConfirm() {
    setWorking(true);
    const result = await deleteAccount(confirmation);
    setWorking(false);

    if (result && !result.ok) {
      toast.error(result.error);
    }
    // Success path redirects on the server.
  }

  return (
    <Card className="bg-card border-destructive/40">
      <CardContent className="pt-6">
        <h2 className="font-serif text-2xl text-foreground">Delete account</h2>
        <p className="mt-2 text-muted-foreground">
          Permanently delete your account, the cookbooks you own, and your
          recipes. You&apos;ll be removed from any shared cookbooks. This
          can&apos;t be undone.
        </p>

        {!open ? (
          <Button
            variant="outline"
            className="mt-5 border-destructive/60 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setOpen(true)}
          >
            Delete account
          </Button>
        ) : (
          <div className="mt-5 space-y-3">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm.
            </Label>
            <Input
              id="confirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false);
                  setConfirmation("");
                }}
                disabled={working}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={working || confirmation !== "DELETE"}
              >
                {working ? "Deleting…" : "Permanently delete account"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
