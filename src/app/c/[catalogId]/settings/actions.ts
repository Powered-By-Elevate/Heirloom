"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateInviteCode } from "@/lib/invite-code";
import type { CatalogRole } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

async function assertOwner(catalogId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, supabase, allowed: false as const };

  const { data: member } = await supabase
    .from("catalog_members")
    .select("role")
    .eq("catalog_id", catalogId)
    .eq("user_id", user.id)
    .single();

  return {
    user,
    supabase,
    allowed: member?.role === "owner",
  };
}

const RegenerateSchema = z.object({ catalog_id: z.string().uuid() });

export async function regenerateInviteCode(
  input: z.infer<typeof RegenerateSchema>,
): Promise<Result> {
  const parsed = RegenerateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { supabase, allowed } = await assertOwner(parsed.data.catalog_id);
  if (!allowed) return { ok: false, error: "Only the owner can do this" };

  let attempt = 0;
  while (attempt < 5) {
    attempt++;
    const newCode = generateInviteCode();
    const { error } = await supabase
      .from("catalogs")
      .update({ invite_code: newCode })
      .eq("id", parsed.data.catalog_id);
    if (!error) {
      revalidatePath(`/c/${parsed.data.catalog_id}/settings`);
      return { ok: true };
    }
    if (error.code !== "23505") return { ok: false, error: error.message };
  }
  return { ok: false, error: "Could not generate a unique code" };
}

const RemoveSchema = z.object({
  catalog_id: z.string().uuid(),
  member_id: z.string().uuid(),
});

export async function removeMember(
  input: z.infer<typeof RemoveSchema>,
): Promise<Result> {
  const parsed = RemoveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { supabase, allowed } = await assertOwner(parsed.data.catalog_id);
  if (!allowed) return { ok: false, error: "Only the owner can do this" };

  // Prevent removing the owner via this action.
  const { data: target } = await supabase
    .from("catalog_members")
    .select("role")
    .eq("id", parsed.data.member_id)
    .single();
  if (target?.role === "owner") {
    return { ok: false, error: "Can't remove the owner" };
  }

  const { error } = await supabase
    .from("catalog_members")
    .delete()
    .eq("id", parsed.data.member_id)
    .eq("catalog_id", parsed.data.catalog_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${parsed.data.catalog_id}/settings`);
  return { ok: true };
}

const RoleSchema = z.object({
  catalog_id: z.string().uuid(),
  member_id: z.string().uuid(),
  role: z.enum(["contributor", "viewer"]),
});

export async function updateMemberRole(
  input: z.infer<typeof RoleSchema>,
): Promise<Result> {
  const parsed = RoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const { supabase, allowed } = await assertOwner(parsed.data.catalog_id);
  if (!allowed) return { ok: false, error: "Only the owner can do this" };

  // Don't let role updates touch the owner row.
  const { data: target } = await supabase
    .from("catalog_members")
    .select("role")
    .eq("id", parsed.data.member_id)
    .single();
  if (target?.role === "owner") {
    return { ok: false, error: "Can't change the owner's role" };
  }

  const { error } = await supabase
    .from("catalog_members")
    .update({ role: parsed.data.role as CatalogRole })
    .eq("id", parsed.data.member_id)
    .eq("catalog_id", parsed.data.catalog_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/c/${parsed.data.catalog_id}/settings`);
  return { ok: true };
}

const LeaveSchema = z.object({ catalog_id: z.string().uuid() });

export async function leaveCatalog(
  input: z.infer<typeof LeaveSchema>,
): Promise<Result> {
  const parsed = LeaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const { data: member } = await supabase
    .from("catalog_members")
    .select("id, role")
    .eq("catalog_id", parsed.data.catalog_id)
    .eq("user_id", user.id)
    .single();

  if (!member) return { ok: false, error: "You're not a member" };
  if (member.role === "owner") {
    return {
      ok: false,
      error: "The owner can't leave their own cookbook. Delete it instead.",
    };
  }

  const { error } = await supabase
    .from("catalog_members")
    .delete()
    .eq("id", member.id);
  if (error) return { ok: false, error: error.message };

  redirect("/catalogs");
}
