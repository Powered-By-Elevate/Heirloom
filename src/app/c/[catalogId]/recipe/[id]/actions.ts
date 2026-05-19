"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const TagsListSchema = z.object({
  existing_ids: z.array(z.string().uuid()).max(50),
  new_names: z.array(z.string().trim().min(1).max(80)).max(50),
});

const UpdateTagsInputSchema = z.object({
  recipe_id: z.string().uuid(),
  catalog_id: z.string().uuid(),
  occasion_tags: TagsListSchema,
  person_tags: TagsListSchema,
});

export type UpdateTagsInput = z.infer<typeof UpdateTagsInputSchema>;
export type UpdateTagsResult = { ok: true } | { ok: false; error: string };

export async function updateRecipeTags(
  input: UpdateTagsInput,
): Promise<UpdateTagsResult> {
  const parsed = UpdateTagsInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid tags",
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const newRows = [
    ...data.occasion_tags.new_names.map((n) => ({
      catalog_id: data.catalog_id,
      name: n,
      category: "occasion" as const,
    })),
    ...data.person_tags.new_names.map((n) => ({
      catalog_id: data.catalog_id,
      name: n,
      category: "person" as const,
    })),
  ];

  let newIds: string[] = [];
  if (newRows.length > 0) {
    const { data: rows, error } = await supabase
      .from("tags")
      .upsert(newRows, {
        onConflict: "catalog_id,name",
        ignoreDuplicates: false,
      })
      .select("id");
    if (error) return { ok: false, error: error.message };
    newIds = (rows ?? []).map((r) => r.id as string);
  }

  const desiredTagIds = Array.from(
    new Set([
      ...data.occasion_tags.existing_ids,
      ...data.person_tags.existing_ids,
      ...newIds,
    ]),
  );

  // Replace the recipe's tag set entirely (delete-then-insert).
  // Trivial volume per recipe, so the simpler approach beats a diff.
  const { error: delErr } = await supabase
    .from("recipe_tags")
    .delete()
    .eq("recipe_id", data.recipe_id);
  if (delErr) return { ok: false, error: delErr.message };

  if (desiredTagIds.length > 0) {
    const { error } = await supabase
      .from("recipe_tags")
      .insert(
        desiredTagIds.map((tag_id) => ({
          recipe_id: data.recipe_id,
          tag_id,
        })),
      );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/c/${data.catalog_id}/recipe/${data.recipe_id}`);
  revalidatePath(`/c/${data.catalog_id}`);
  return { ok: true };
}
