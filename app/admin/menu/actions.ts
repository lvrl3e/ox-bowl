"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateMenuItemSchema } from "@/lib/validations/admin";
import type { AdminRole } from "@/lib/types/database";

export interface MenuActionState {
  error: string | null;
  success: boolean;
}

async function requireAdminSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return { supabase, userId: data.user.id };
}

async function requireOwnerSession() {
  const { supabase, userId } = await requireAdminSession();

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", userId)
    .single<{ role: AdminRole }>();

  return { supabase, isOwner: adminUser?.role === "owner" };
}

function revalidateMenuPages() {
  revalidatePath("/admin/menu");
  revalidatePath("/");
  revalidatePath("/order");
  revalidatePath("/checkout");
}

export async function setSoldOutAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const { supabase } = await requireAdminSession();

  const itemId = formData.get("itemId");
  const isSoldOut = formData.get("isSoldOut") === "true";
  if (typeof itemId !== "string") {
    return { error: "Missing item.", success: false };
  }

  // Marking something sold out is a normal shift task, not an
  // owner-only decision — this RPC runs as security definer so any
  // signed-in admin (owner or staff) can call it, even though direct
  // writes to menu_items otherwise require the owner role.
  const { data: result, error } = await supabase.rpc("set_menu_item_sold_out", {
    p_item_id: itemId,
    p_sold_out: isSoldOut,
  });
  const rpcResult = result as { success: boolean; error?: string } | null;
  if (error || !rpcResult?.success) {
    return { error: rpcResult?.error ?? "Failed to update.", success: false };
  }

  revalidateMenuPages();
  return { error: null, success: true };
}

export async function updateMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const { supabase, isOwner } = await requireOwnerSession();
  if (!isOwner) {
    return { error: "Only the owner can edit the menu.", success: false };
  }

  const variantIds = formData.getAll("variantId").map(String);
  const variantPrices = formData.getAll("variantPrice").map(String);
  const basePriceRaw = formData.get("basePrice");

  const parsed = updateMenuItemSchema.safeParse({
    itemId: formData.get("itemId"),
    description: formData.get("description") ?? "",
    basePrice:
      basePriceRaw === null || basePriceRaw === "" ? null : basePriceRaw,
    variantPrices: variantIds.map((id, i) => ({ id, price: variantPrices[i] })),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      success: false,
    };
  }
  const {
    itemId,
    description,
    basePrice,
    variantPrices: parsedVariants,
  } = parsed.data;

  const { error: itemError } = await supabase
    .from("menu_items")
    .update({ description: description || null, base_price: basePrice })
    .eq("id", itemId);
  if (itemError) {
    return { error: "Failed to update the item.", success: false };
  }

  for (const variant of parsedVariants) {
    const { error: variantError } = await supabase
      .from("item_variants")
      .update({ price: variant.price })
      .eq("id", variant.id);
    if (variantError) {
      return {
        error: "Item saved, but a variant price failed to update.",
        success: false,
      };
    }
  }

  revalidateMenuPages();
  return { error: null, success: true };
}
