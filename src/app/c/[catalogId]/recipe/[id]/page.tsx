import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Recipe",
};
import { Card, CardContent } from "@/components/ui/card";
import { RecipeTagsEditor } from "./RecipeTagsEditor";
import type {
  Catalog,
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  Tag,
  CatalogRole,
} from "@/lib/types";

interface PageProps {
  params: Promise<{ catalogId: string; id: string }>;
}

export default async function RecipeDetailPage({ params }: PageProps) {
  const { catalogId, id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    catalogQ,
    recipeQ,
    ingredientsQ,
    instructionsQ,
    tagsQ,
    memberQ,
    allTagsQ,
  ] = await Promise.all([
    supabase.from("catalogs").select("*").eq("id", catalogId).single(),
    supabase.from("recipes").select("*").eq("id", id).single(),
    supabase
      .from("recipe_ingredients")
      .select("*")
      .eq("recipe_id", id)
      .order("position"),
    supabase
      .from("recipe_instructions")
      .select("*")
      .eq("recipe_id", id)
      .order("position"),
    supabase
      .from("recipe_tags")
      .select("tags(*)")
      .eq("recipe_id", id),
    supabase
      .from("catalog_members")
      .select("role")
      .eq("catalog_id", catalogId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("tags")
      .select("*")
      .eq("catalog_id", catalogId)
      .order("name"),
  ]);

  const catalog = catalogQ.data;
  const recipe = recipeQ.data;
  if (!catalog || !recipe) notFound();

  const r = recipe as Recipe;
  const ings = (ingredientsQ.data as RecipeIngredient[] | null) ?? [];
  const steps = (instructionsQ.data as RecipeInstruction[] | null) ?? [];

  const recipeTagRows = (tagsQ.data ?? []) as unknown as Array<{
    tags: Tag | null;
  }>;
  const currentTags: Tag[] = recipeTagRows
    .map((rt) => rt.tags)
    .filter((t): t is Tag => Boolean(t));
  const currentOccasions = currentTags.filter((t) => t.category === "occasion");
  const currentPeople = currentTags.filter((t) => t.category === "person");

  const allTags: Tag[] = allTagsQ.data ?? [];
  const allOccasionTags = allTags.filter((t) => t.category === "occasion");
  const allPersonTags = allTags.filter((t) => t.category === "person");

  const role: CatalogRole = (memberQ.data?.role ?? "viewer") as CatalogRole;
  const canEdit = role === "owner" || role === "contributor";

  return (
    <>
      <AppHeader catalogName={(catalog as Catalog).name} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <Link
          href={`/c/${catalogId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to {(catalog as Catalog).name}
        </Link>

        <header className="mt-4 mb-2">
          <h1 className="font-serif text-5xl text-foreground leading-tight">
            {r.title}
          </h1>
          {currentPeople.length > 0 ? (
            <p className="mt-2 text-lg text-muted-foreground italic">
              from {currentPeople.map((p) => p.name).join(", ")}
            </p>
          ) : null}
          {r.description ? (
            <p className="mt-5 text-foreground leading-relaxed">
              {r.description}
            </p>
          ) : null}
        </header>

        <RecipeTagsEditor
          recipeId={r.id}
          catalogId={catalogId}
          canEdit={canEdit}
          currentOccasions={currentOccasions}
          currentPeople={currentPeople}
          allOccasionTags={allOccasionTags}
          allPersonTags={allPersonTags}
        />

        {r.prep_time_minutes || r.cook_time_minutes || r.servings ? (
          <div className="flex gap-6 mt-8 mb-8 text-sm text-muted-foreground">
            {r.prep_time_minutes ? (
              <span>
                <span className="font-medium text-foreground">
                  {r.prep_time_minutes}m
                </span>{" "}
                prep
              </span>
            ) : null}
            {r.cook_time_minutes ? (
              <span>
                <span className="font-medium text-foreground">
                  {r.cook_time_minutes}m
                </span>{" "}
                cook
              </span>
            ) : null}
            {r.servings ? (
              <span>
                serves{" "}
                <span className="font-medium text-foreground">
                  {r.servings}
                </span>
              </span>
            ) : null}
          </div>
        ) : (
          <div className="mt-8" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
          {ings.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl text-foreground mb-3">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {ings.map((ing) => (
                  <li key={ing.id} className="text-foreground">
                    {ing.amount ? (
                      <span className="text-muted-foreground">
                        {ing.amount}{" "}
                      </span>
                    ) : null}
                    {ing.item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {steps.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl text-foreground mb-3">Steps</h2>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={s.id} className="flex gap-3">
                    <span className="font-serif text-2xl text-primary leading-none w-7">
                      {i + 1}
                    </span>
                    <span className="text-foreground leading-relaxed flex-1">
                      {s.step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        {r.notes ? (
          <Card className="mt-10 bg-accent/40 border-border/60">
            <CardContent className="pt-6">
              <h3 className="font-serif text-xl text-foreground mb-2">Notes</h3>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {r.notes}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </>
  );
}
