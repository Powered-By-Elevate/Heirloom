import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your cookbooks",
};
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppHeader } from "@/components/AppHeader";
import { Plus } from "lucide-react";
import type { Catalog } from "@/lib/types";

export default async function CatalogsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: catalogs } = await supabase
    .from("catalogs")
    .select("*")
    .order("created_at", { ascending: false });

  const list: Catalog[] = catalogs ?? [];

  return (
    <>
      <AppHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl text-foreground">
              Your cookbooks
            </h1>
            <p className="mt-2 text-muted-foreground">
              {list.length === 0
                ? "Start one for your family."
                : list.length === 1
                  ? "1 cookbook"
                  : `${list.length} cookbooks`}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/catalogs/new">
              <Plus className="size-4" />
              New cookbook
            </Link>
          </Button>
        </div>

        {list.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((c) => (
              <CatalogCard key={c.id} catalog={c} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function CatalogCard({ catalog }: { catalog: Catalog }) {
  return (
    <Link href={`/c/${catalog.id}`}>
      <Card className="bg-card border-border/60 hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <h2 className="font-serif text-2xl text-foreground">
            {catalog.name}
          </h2>
          {catalog.description ? (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {catalog.description}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card className="bg-card border-dashed border-2 border-border/60">
      <CardContent className="py-16 text-center">
        <p className="font-serif text-2xl text-foreground">
          No cookbooks yet.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/catalogs/new">
            <Plus className="size-4" />
            Create your first cookbook
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
