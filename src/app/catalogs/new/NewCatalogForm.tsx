"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createCatalog } from "./actions";

export function NewCatalogForm() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    const result = await createCatalog(formData);
    setSubmitting(false);
    // On success, server action redirects; on failure, surface error.
    if (result && !result.ok) {
      toast.error(result.error);
    }
  }

  return (
    <Card className="bg-card border-border/60">
      <CardContent className="pt-6">
        <form action={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Cookbook name</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={80}
              placeholder="e.g. The Knowles Family Cookbook"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground font-normal">— optional</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              maxLength={500}
              rows={3}
              placeholder="Recipes from Grandma Jean, holiday favorites, and the things mom still makes for Sunday dinner."
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Creating…" : "Create cookbook"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
