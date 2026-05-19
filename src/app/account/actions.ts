"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string };

export async function deleteAccount(
  confirmation: string,
): Promise<DeleteAccountResult> {
  if (confirmation !== "DELETE") {
    return { ok: false, error: "Type DELETE to confirm." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      error:
        "Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY to your environment.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, error: error.message };

  // Clear the session cookies on this device.
  await supabase.auth.signOut();
  redirect("/");
}
