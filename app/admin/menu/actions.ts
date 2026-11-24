"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicStorageUrl } from "@/lib/supabase/storage";
import { addMenuItemSchema, updateMenuItemSchema } from "@/lib/validations/admin";
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

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "item";
}

// The "assets" storage bucket has no write policy for any role except
// service_role (see 0001_init.sql) — requireOwnerSession above already
// verified is_owner(), so this is the one escape hatch to the
// service-role client, same approach as the settings QR image upload.
async function uploadMenuImage(
  image: File,
  slug: string,
): Promise<string | null> {
  const ext = image.name.split(".").pop() || "jpg";
  const path = `menu/${slug}-${Date.now()}.${ext}`;
  const adminClient = createAdminClient();
  const { error } = await adminClient.storage
    .from("assets")
    .upload(path, image, { contentType: image.type, upsert: true });
  if (error) return null;
  return publicStorageUrl("assets", path);
}

export async function addMenuItemAction(
  _prevState: MenuActionState,
  formData: FormData,
): Promise<MenuActionState> {
  const { supabase, isOwner } = await requireOwnerSession();
  if (!isOwner) {
    return { error: "Only the owner can edit the menu.", success: false };
  }

  const hasVariants = formData.get("hasVariants") === "true";
  const basePriceRaw = formData.get("basePrice");

  const parsed = addMenuItemSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    hasVariants,
    basePrice:
      hasVariants || basePriceRaw === null || basePriceRaw === ""
        ? null
        : basePriceRaw,
    variantLabels: hasVariants ? formData.getAll("variantLabel").map(String) : [],
    variantPrices: hasVariants ? formData.getAll("variantPrice").map(String) : [],
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
      success: false,
    };
  }
  const { categoryId, name, description, basePrice, variantLabels, variantPrices } =
    parsed.data;

  const { data: lastItem } = await supabase
    .from("menu_items")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();
  const nextSortOrder = (lastItem?.sort_order ?? -1) + 1;

  const imageFile = formData.get("image");
  const imageUrl =
    imageFile instanceof File && imageFile.size > 0
      ? await uploadMenuImage(imageFile, slugify(name))
      : null;

  const baseSlug = slugify(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;

    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .insert({
        category_id: categoryId,
        slug,
        name,
        description: description || null,
        base_price: hasVariants ? null : basePrice,
        has_variants: hasVariants,
        sort_order: nextSortOrder,
        image_url: imageUrl,
      })
      .select("id")
      .single<{ id: string }>();

    if (itemError) {
      // Unique slug collision — retry with a numeric suffix.
      if (itemError.code === "23505") continue;
      return { error: "Failed to add the item.", success: false };
    }

    if (hasVariants && item) {
      const { error: variantsError } = await supabase.from("item_variants").insert(
        variantLabels.map((label, i) => ({
          item_id: item.id,
          label,
          price: variantPrices[i],
          sort_order: i,
        })),
      );
      if (variantsError) {
        return {
          error: "Item added, but its sizes failed to save.",
          success: false,
        };
      }
    }

    revalidateMenuPages();
    return { error: null, success: true };
  }

  return { error: "Failed to add the item.", success: false };
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

  const update: Record<string, unknown> = {
    description: description || null,
    base_price: basePrice,
  };

  const imageFile = formData.get("image");
  if (imageFile instanceof File && imageFile.size > 0) {
    const imageUrl = await uploadMenuImage(imageFile, itemId);
    if (!imageUrl) {
      return { error: "Failed to upload photo.", success: false };
    }
    update.image_url = imageUrl;
  }

  const { error: itemError } = await supabase
    .from("menu_items")
    .update(update)
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
