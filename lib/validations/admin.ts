import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const addStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["owner", "staff"]),
});

export type AddStaffInput = z.infer<typeof addStaffSchema>;

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const priceSchema = z.coerce.number().min(0, "Price can't be negative");

export const updateMenuItemSchema = z.object({
  itemId: z.string().uuid(),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  basePrice: priceSchema.nullable(),
  variantPrices: z.array(
    z.object({ id: z.string().uuid(), price: priceSchema }),
  ),
});

export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export const addMenuItemSchema = z
  .object({
    categoryId: z.string().uuid(),
    name: z.string().trim().min(1, "Name is required").max(100, "Keep it under 100 characters"),
    description: z.string().trim().max(500, "Keep it under 500 characters"),
    hasVariants: z.boolean(),
    basePrice: priceSchema.nullable(),
    variantLabels: z.array(
      z.string().trim().min(1, "Variant name is required").max(40),
    ),
    variantPrices: z.array(priceSchema),
  })
  .refine((data) => data.hasVariants || data.basePrice !== null, {
    message: "Enter a price",
    path: ["basePrice"],
  })
  .refine((data) => !data.hasVariants || data.variantLabels.length > 0, {
    message: "Add at least one size/variant",
    path: ["variantLabels"],
  })
  .refine((data) => data.variantLabels.length === data.variantPrices.length, {
    message: "Each size/variant needs a price",
    path: ["variantPrices"],
  });

export type AddMenuItemInput = z.infer<typeof addMenuItemSchema>;
