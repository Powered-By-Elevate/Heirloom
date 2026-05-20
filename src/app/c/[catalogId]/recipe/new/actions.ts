"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TagsInputSchema = z.object({
  existing_ids: z.array(z.string().uuid()).max(50),
  new_names: z.array(z.string().trim().min(1).max(80)).max(50),
});

const RecipeInputSchema = z.object({
  id: z.string().uuid().optional(),
  catalog_id: z.string().uuid(),
  title: z.string().trim().min(1, "Recipe needs a title").max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  prep_time_minutes: z.number().int().min(0).max(1440).optional().nullable(),
  cook_time_minutes: z.number().int().min(0).max(1440).optional().nullable(),
  servings: z.number().int().min(1).max(100).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  dish_photo_url: z.string().url().optional().nullable(),
  ingredients: z
    .array(
      z.object({
        amount: z.string().trim().max(50).optional().nullable(),
        item: z.string().trim().min(1).max(200),
      }),
    )
    .max(100),
  instructions: z
    .array(
      z.object({
        step: z.string().trim().min(1).max(2000),
      }),
    )
    .max(100),
  occasion_tags: TagsInputSchema,
  person_tags: TagsInputSchema,
});

export type RecipeInput = z.infer<typeof RecipeInputSchema>;

export type CreateRecipeResult =
  | { ok: true; recipeId: string }
  | { ok: false; error: string };

export async function createRecipe(
  input: RecipeInput,
): Promise<CreateRecipeResult> {
  const parsed = RecipeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid recipe",
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: recipe, error: recipeErr } = await supabase
    .from("recipes")
    .insert({
      ...(data.id ? { id: data.id } : {}),
      catalog_id: data.catalog_id,
      title: data.title,
      description: data.description || null,
      contributed_by: user.id,
      prep_time_minutes: data.prep_time_minutes ?? null,
      cook_time_minutes: data.cook_time_minutes ?? null,
      servings: data.servings ?? null,
      notes: data.notes || null,
      dish_photo_url: data.dish_photo_url || null,
    })
    .select("id")
    .single();

  if (recipeErr || !recipe) {
    return { ok: false, error: recipeErr?.message ?? "Could not save recipe" };
  }

  const recipeId = recipe.id as string;

  if (data.ingredients.length > 0) {
    const { error } = await supabase.from("recipe_ingredients").insert(
      data.ingredients.map((ing, i) => ({
        recipe_id: recipeId,
        position: i,
        amount: ing.amount || null,
        item: ing.item,
      })),
    );
    if (error) {
      await supabase.from("recipes").delete().eq("id", recipeId);
      return { ok: false, error: error.message };
    }
  }

  if (data.instructions.length > 0) {
    const { error } = await supabase.from("recipe_instructions").insert(
      data.instructions.map((ins, i) => ({
        recipe_id: recipeId,
        position: i,
        step: ins.step,
      })),
    );
    if (error) {
      await supabase.from("recipes").delete().eq("id", recipeId);
      return { ok: false, error: error.message };
    }
  }

  // Resolve new tag names → tag IDs (upsert with onConflict on the unique key).
  const newTagsRows = [
    ...data.occasion_tags.new_names.map((name) => ({
      catalog_id: data.catalog_id,
      name,
      category: "occasion" as const,
    })),
    ...data.person_tags.new_names.map((name) => ({
      catalog_id: data.catalog_id,
      name,
      category: "person" as const,
    })),
  ];

  let resolvedNewIds: string[] = [];
  if (newTagsRows.length > 0) {
    const { data: inserted, error } = await supabase
      .from("tags")
      .upsert(newTagsRows, {
        onConflict: "catalog_id,name",
        ignoreDuplicates: false,
      })
      .select("id");
    if (error) {
      await supabase.from("recipes").delete().eq("id", recipeId);
      return { ok: false, error: error.message };
    }
    resolvedNewIds = (inserted ?? []).map((r) => r.id as string);
  }

  const allTagIds = Array.from(
    new Set([
      ...data.occasion_tags.existing_ids,
      ...data.person_tags.existing_ids,
      ...resolvedNewIds,
    ]),
  );

  if (allTagIds.length > 0) {
    const { error } = await supabase.from("recipe_tags").insert(
      allTagIds.map((tag_id) => ({ recipe_id: recipeId, tag_id })),
    );
    if (error) {
      await supabase.from("recipes").delete().eq("id", recipeId);
      return { ok: false, error: error.message };
    }
  }

  redirect(`/c/${data.catalog_id}/recipe/${recipeId}`);
}
