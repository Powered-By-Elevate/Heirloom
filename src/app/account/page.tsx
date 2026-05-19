import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteAccountSection } from "./DeleteAccountSection";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader />
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12 space-y-6">
        <div>
          <Link
            href="/catalogs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to cookbooks
          </Link>
          <h1 className="font-serif text-4xl text-foreground mt-3">Account</h1>
        </div>

        <Card className="bg-card border-border/60">
          <CardContent className="pt-6">
            <h2 className="font-serif text-2xl text-foreground">
              Signed in as
            </h2>
            <p className="mt-2 text-foreground">{user.email}</p>
          </CardContent>
        </Card>

        <DeleteAccountSection />

        <Card className="bg-card border-border/60">
          <CardContent className="pt-6">
            <h2 className="font-serif text-2xl text-foreground">Legal</h2>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
