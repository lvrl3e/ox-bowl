"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addStaffSchema } from "@/lib/validations/admin";
import type { AdminRole } from "@/lib/types/database";

export interface AddStaffState {
  error: string | null;
  success: boolean;
}

async function requireOwnerSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: AdminRole }>();

  return { supabase, currentUserId: data.user.id, isOwner: adminUser?.role === "owner" };
}

export async function addStaffAction(
  _prevState: AddStaffState,
  formData: FormData
): Promise<AddStaffState> {
  const { supabase, isOwner } = await requireOwnerSession();
  if (!isOwner) {
    return { error: "Only the owner can add staff.", success: false };
  }

  const parsed = addStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false };
  }
  const { name, email, password, role } = parsed.data;

  const adminClient = createAdminClient();
  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return {
      error: createError?.message ?? "Failed to create the account.",
      success: false,
    };
  }

  // Inserted through the owner's own session (not the service-role
  // client) — admin_users only allows writes via RLS's is_owner()
  // check, which this request satisfies since we already verified
  // the caller is an owner above.
  const { error: insertError } = await supabase
    .from("admin_users")
    .insert({ id: created.user.id, name, role });
  if (insertError) {
    return { error: "Account created, but failed to grant admin access.", success: false };
  }

  revalidatePath("/admin/staff");
  return { error: null, success: true };
}

export async function removeStaffAction(formData: FormData) {
  const { supabase, currentUserId, isOwner } = await requireOwnerSession();
  if (!isOwner) return;

  const id = formData.get("id");
  if (typeof id !== "string" || id === currentUserId) return;

  await supabase.from("admin_users").delete().eq("id", id);
  revalidatePath("/admin/staff");
}
