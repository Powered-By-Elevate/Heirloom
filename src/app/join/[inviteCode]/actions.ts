"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const AcceptSchema = z.object({ invite_code: z.string().min(1).max(32) });

export type AcceptInviteResult =
  | { ok: true; catalogId: string }
  | { ok: false; error: string };

export async function acceptInvite(
  input: z.infer<typeof AcceptSchema>,
): Promise<AcceptInviteResult> {
  const parsed = AcceptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid invite code" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to accept the invite" };

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id")
    .eq("invite_code", parsed.data.invite_code)
    .single();

  if (!catalog) {
    return {
      ok: false,
      error: "This invite link isn't valid anymore.",
    };
  }

  const catalogId = catalog.id as string;

  // Already a member? Treat as success.
  const { data: existing } = await supabase
    .from("catalog_members")
    .select("id")
    .eq("catalog_id", catalogId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("catalog_members")
      .insert({
        catalog_id: catalogId,
        user_id: user.id,
        role: "contributor",
      });
    if (error) return { ok: false, error: error.message };
  }

  redirect(`/c/${catalogId}`);
}
