import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AcceptInviteButton } from "./AcceptInviteButton";

export const metadata: Metadata = {
  title: "Join cookbook",
};

interface PageProps {
  params: Promise<{ inviteCode: string }>;
}

export default async function JoinPage({ params }: PageProps) {
  const { inviteCode } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Look up the catalog by invite code. RLS allows authenticated users to read
  // catalogs by invite_code via the lookup policy. Unauthenticated users
  // get sent to signup first and brought back here via ?next=.
  if (!user) {
    redirect(`/signup?next=/join/${inviteCode}`);
  }

  const { data: catalog } = await supabase
    .from("catalogs")
    .select("id, name, description")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (!catalog) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-4xl text-foreground">
            Invite not found
          </h1>
          <p className="mt-3 text-muted-foreground">
            This invite link isn&apos;t valid anymore. Ask whoever shared it
            for a new one.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/catalogs">Back to your cookbooks</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Already a member? Skip the confirmation and go straight in.
  const { data: existing } = await supabase
    .from("catalog_members")
    .select("id")
    .eq("catalog_id", catalog.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    redirect(`/c/${catalog.id}`);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="max-w-md w-full">
        <Card className="bg-card border-border/60">
          <CardContent className="pt-6 text-center">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              You&apos;ve been invited to
            </p>
            <h1 className="font-serif text-4xl text-foreground mt-2">
              {catalog.name}
            </h1>
            {catalog.description ? (
              <p className="mt-3 text-muted-foreground">
                {catalog.description}
              </p>
            ) : null}
            <p className="mt-6 text-sm text-muted-foreground">
              You&apos;ll join as a contributor — you&apos;ll be able to view
              all recipes and add new ones.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <AcceptInviteButton inviteCode={inviteCode} />
              <Button asChild variant="ghost">
                <Link href="/catalogs">Not now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
