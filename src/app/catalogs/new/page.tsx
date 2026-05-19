import type { Metadata } from "next";
import Link from "next/link";
import { NewCatalogForm } from "./NewCatalogForm";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "New cookbook",
};

export default function NewCatalogPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/catalogs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to cookbooks
          </Link>
          <h1 className="font-serif text-4xl text-foreground mt-3">
            New cookbook
          </h1>
          <p className="mt-2 text-muted-foreground">
            Give it a name and an optional description.
          </p>
        </div>
        <NewCatalogForm />
      </main>
    </>
  );
}
