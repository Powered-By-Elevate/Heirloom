"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";
import { DEFAULT_OCCASION_TAGS } from "@/lib/types";

const CreateCatalogSchema = z.object({
  name: z.string().trim().min(1, "Give your cookbook a name").max(80),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateCatalogResult =
  | { ok: true; catalogId: string }
  | { ok: false; error: string };

export async function createCatalog(formData: FormData): Promise<CreateCatalogResult> {
  const parsed = CreateCatalogSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  // Retry on the astronomically unlikely invite_code collision.
  let attempt = 0;
  let catalogId: string | null = null;
  while (attempt < 5 && !catalogId) {
    attempt++;
    const inviteCode = generateInviteCode();
    const { data, error } = await supabase
      .from("catalogs")
      .insert({
        name: parsed.data.name,
        description: parsed.data.description || null,
        owner_id: user.id,
        invite_code: inviteCode,
      })
      .select("id")
      .single();

    if (!error && data) {
      catalogId = data.id as string;
      break;
    }
    if (error && error.code !== "23505") {
      return { ok: false, error: error.message };
    }
  }

  if (!catalogId) return { ok: false, error: "Could not generate invite code" };

  const { error: memberErr } = await supabase
    .from("catalog_members")
    .insert({ catalog_id: catalogId, user_id: user.id, role: "owner" });
  if (memberErr) return { ok: false, error: memberErr.message };

  const { error: tagErr } = await supabase.from("tags").insert(
    DEFAULT_OCCASION_TAGS.map((name) => ({
      catalog_id: catalogId!,
      name,
      category: "occasion" as const,
    })),
  );
  if (tagErr) return { ok: false, error: tagErr.message };

  redirect(`/c/${catalogId}`);
}
