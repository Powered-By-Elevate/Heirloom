import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Cookbook",
};
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { CatalogSearch } from "./CatalogSearch";
import type { Catalog, Recipe, Tag, CatalogRole } from "@/lib/types";

interface PageProps {
  params: Promise<{ catalogId: string }>;
  searchParams: Promise<{ q?: string; occasion?: string; person?: string }>;
}

export default async function CatalogHomePage({
  params,
  searchParams,
}: PageProps) {
  const { catalogId } = await params;
  const { q, occasion, person } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("*")
    .eq("id", catalogId)
    .single();
  if (!catalog) notFound();

  const { data: memberRow } = await supabase
    .from("catalog_members")
    .select("role")
    .eq("catalog_id", catalogId)
    .eq("user_id", user.id)
    .single();
  const role: CatalogRole = (memberRow?.role ?? "viewer") as CatalogRole;
  const canAdd = role === "owner" || role === "contributor";

  // Recipes — apply search + optional tag filter.
  let recipes: Recipe[] = [];
  if (occasion || person) {
    const tagName = (occasion ?? person)!;
    const tagCategory = occasion ? "occasion" : "person";
    let qy = supabase
      .from("recipes")
      .select("*, recipe_tags!inner(tags!inner(name, category))")
      .eq("catalog_id", catalogId)
      .eq("recipe_tags.tags.name", tagName)
      .eq("recipe_tags.tags.category", tagCategory)
      .order("created_at", { ascending: false });
    if (q) qy = qy.ilike("title", `%${q}%`);
    const { data } = await qy;
    recipes = (data as Recipe[] | null) ?? [];
  } else {
    let qy = supabase
      .from("recipes")
      .select("*")
      .eq("catalog_id", catalogId)
      .order("created_at", { ascending: false });
    if (q) qy = qy.ilike("title", `%${q}%`);
    const { data } = await qy;
    recipes = (data as Recipe[] | null) ?? [];
  }

  // Only show occasions/people in the sidebar that actually have recipes.
  const [{ data: allTagsData }, { data: recipeTagsData }] = await Promise.all([
    supabase
      .from("tags")
      .select("*")
      .eq("catalog_id", catalogId)
      .order("name"),
    supabase
      .from("recipe_tags")
      .select("tag_id, recipes!inner(catalog_id)")
      .eq("recipes.catalog_id", catalogId),
  ]);
  const usedTagIds = new Set(
    (recipeTagsData ?? []).map((rt) => rt.tag_id as string),
  );
  const allTags: Tag[] = allTagsData ?? [];
  const usedTags = allTags.filter((t) => usedTagIds.has(t.id));
  const usedOccasions = usedTags.filter((t) => t.category === "occasion");
  const usedPeople = usedTags.filter((t) => t.category === "person");

  return (
    <>
      <AppHeader catalogName={(catalog as Catalog).name} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-serif text-4xl text-foreground">
              {(catalog as Catalog).name}
            </h1>
            {(catalog as Catalog).description ? (
              <p className="mt-2 text-muted-foreground max-w-xl">
                {(catalog as Catalog).description}
              </p>
            ) : null}
          </div>
          {canAdd ? (
            <Button asChild size="lg">
              <Link href={`/c/${catalogId}/recipe/new`}>
                <Plus className="size-4" />
                Add a recipe
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
          <aside className="space-y-6">
            {usedOccasions.length > 0 ? (
              <FilterSection title="Occasions">
                {usedOccasions.map((t) => (
                  <FilterLink
                    key={t.id}
                    href={`/c/${catalogId}?occasion=${encodeURIComponent(t.name)}`}
                    active={occasion === t.name}
                    label={t.name}
                  />
                ))}
              </FilterSection>
            ) : null}

            {usedPeople.length > 0 ? (
              <FilterSection title="From">
                {usedPeople.map((t) => (
                  <FilterLink
                    key={t.id}
                    href={`/c/${catalogId}?person=${encodeURIComponent(t.name)}`}
                    active={person === t.name}
                    label={t.name}
                  />
                ))}
              </FilterSection>
            ) : null}

            {usedOccasions.length === 0 && usedPeople.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tag recipes with people and occasions to filter them here.
              </p>
            ) : null}

            {occasion || person || q ? (
              <Link
                href={`/c/${catalogId}`}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Clear filters
              </Link>
            ) : null}
          </aside>

          <section className="space-y-6">
            <CatalogSearch defaultValue={q ?? ""} catalogId={catalogId} />

            {occasion || person ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Filtered by:</span>
                {occasion ? <Badge variant="secondary">{occasion}</Badge> : null}
                {person ? <Badge variant="secondary">{person}</Badge> : null}
              </div>
            ) : null}

            {recipes.length === 0 ? (
              <EmptyRecipes canAdd={canAdd} catalogId={catalogId} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recipes.map((r) => (
                  <RecipeCard key={r.id} recipe={r} catalogId={catalogId} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-serif text-lg text-foreground mb-2">{title}</h3>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`text-sm py-1 px-2 -mx-2 rounded transition-colors ${
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
      }`}
    >
      {label}
    </Link>
  );
}

function RecipeCard({
  recipe,
  catalogId,
}: {
  recipe: Recipe;
  catalogId: string;
}) {
  return (
    <Link href={`/c/${catalogId}/recipe/${recipe.id}`}>
      <Card className="bg-card border-border/60 hover:shadow-md transition-shadow h-full overflow-hidden">
        {recipe.dish_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.dish_photo_url}
            alt={recipe.title}
            className="w-full h-44 object-cover"
          />
        ) : null}
        <CardContent className="p-5">
          <h2 className="font-serif text-xl text-foreground">{recipe.title}</h2>
          {recipe.description ? (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyRecipes({
  canAdd,
  catalogId,
}: {
  canAdd: boolean;
  catalogId: string;
}) {
  return (
    <Card className="bg-card border-dashed border-2 border-border/60">
      <CardContent className="py-16 text-center">
        <p className="font-serif text-2xl text-foreground">No recipes yet.</p>
        {canAdd ? (
          <Button asChild size="lg" className="mt-6">
            <Link href={`/c/${catalogId}/recipe/new`}>
              <Plus className="size-4" />
              Add a recipe
            </Link>
          </Button>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Ask the cookbook owner to add some.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
