import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { RecipeForm } from "./RecipeForm";

export const metadata: Metadata = {
  title: "Add a recipe",
};
import type { Catalog, Tag } from "@/lib/types";

interface PageProps {
  params: Promise<{ catalogId: string }>;
}

export default async function NewRecipePage({ params }: PageProps) {
  const { catalogId } = await params;

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

  if (!memberRow || memberRow.role === "viewer") {
    redirect(`/c/${catalogId}`);
  }

  const { data: tagsData } = await supabase
    .from("tags")
    .select("*")
    .eq("catalog_id", catalogId)
    .order("name");
  const allTags: Tag[] = tagsData ?? [];
  const occasionTags = allTags.filter((t) => t.category === "occasion");
  const personTags = allTags.filter((t) => t.category === "person");

  return (
    <>
      <AppHeader catalogName={(catalog as Catalog).name} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href={`/c/${catalogId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {(catalog as Catalog).name}
          </Link>
          <h1 className="font-serif text-4xl text-foreground mt-3">
            Add a recipe
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fill it in below. Photo upload from a recipe card is coming next.
          </p>
        </div>
        <RecipeForm
          catalogId={catalogId}
          occasionTags={occasionTags}
          personTags={personTags}
        />
      </main>
    </>
  );
}
