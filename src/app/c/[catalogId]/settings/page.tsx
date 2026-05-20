import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AppHeader } from "@/components/AppHeader";
import { InviteSection } from "./InviteSection";
import { MembersList, type MemberRow } from "./MembersList";
import { LeaveCookbookSection } from "./LeaveCookbookSection";
import { DeleteCookbookSection } from "./DeleteCookbookSection";
import { getSiteUrl } from "@/lib/get-site-url";
import type { Catalog, CatalogRole } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cookbook settings",
};

interface PageProps {
  params: Promise<{ catalogId: string }>;
}

export default async function CatalogSettingsPage({ params }: PageProps) {
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

  const { data: selfMember } = await supabase
    .from("catalog_members")
    .select("role")
    .eq("catalog_id", catalogId)
    .eq("user_id", user.id)
    .single();
  const role: CatalogRole = (selfMember?.role ?? "viewer") as CatalogRole;
  const isOwner = role === "owner";

  const { data: memberRows } = await supabase
    .from("catalog_members")
    .select("id, user_id, role, joined_at")
    .eq("catalog_id", catalogId)
    .order("joined_at");

  // Email resolution requires the admin API since auth.users isn't exposed
  // to authenticated role. Only fetched for members we already see via RLS.
  const admin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminClient()
    : null;

  const members: MemberRow[] = await Promise.all(
    (memberRows ?? []).map(async (m) => {
      let email = "—";
      if (admin) {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        email = data?.user?.email ?? "—";
      }
      return {
        id: m.id as string,
        user_id: m.user_id as string,
        email,
        role: m.role as CatalogRole,
        joined_at: m.joined_at as string,
        is_self: m.user_id === user.id,
      };
    }),
  );

  const cat = catalog as Catalog;
  const inviteUrl = `${getSiteUrl()}/join/${cat.invite_code}`;

  return (
    <>
      <AppHeader catalogName={cat.name} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-6">
        <div>
          <Link
            href={`/c/${catalogId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to {cat.name}
          </Link>
          <h1 className="font-serif text-4xl text-foreground mt-3">
            Cookbook settings
          </h1>
          {!isOwner ? (
            <p className="mt-2 text-muted-foreground">
              You can see who&apos;s here. Only the owner can invite new people
              or change roles.
            </p>
          ) : null}
        </div>

        {isOwner ? (
          <InviteSection catalogId={catalogId} inviteUrl={inviteUrl} />
        ) : null}

        <MembersList
          catalogId={catalogId}
          members={isOwner ? members : members.map((m) => ({ ...m, role: m.role }))}
        />

        {!isOwner ? (
          <LeaveCookbookSection catalogId={catalogId} catalogName={cat.name} />
        ) : null}

        {isOwner ? (
          <DeleteCookbookSection catalogId={catalogId} catalogName={cat.name} />
        ) : null}
      </main>
    </>
  );
}
