import { z } from "zod";

export const cartLineSchema = z.object({
  itemId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  quantity: z.number().int().min(1).max(50),
});

export const checkoutSchema = z
  .object({
    fulfillmentType: z.enum(["pickup", "delivery"]),
    customerName: z.string().trim().min(1, "Name is required").max(100),
    customerMobile: z
      .string()
      .trim()
      .regex(/^(09\d{9}|\+639\d{9})$/, "Enter a valid PH mobile number"),
    scheduleType: z.enum(["asap", "scheduled"]),
    scheduledTime: z.string().datetime().nullable().optional(),
    deliveryAddress: z.string().trim().max(300).optional(),
    deliveryLandmark: z.string().trim().max(200).optional(),
    notes: z.string().trim().max(500).optional(),
    paymentMethod: z.enum(["cash", "qr"]),
    paymentReferenceNumber: z.string().trim().max(100).optional(),
    items: z.array(cartLineSchema).min(1, "Cart is empty"),
  })
  .refine(
    (data) =>
      data.fulfillmentType !== "delivery" ||
      (!!data.deliveryAddress && data.deliveryAddress.length > 0),
    { message: "Delivery address is required", path: ["deliveryAddress"] }
  )
  .refine(
    (data) =>
      data.scheduleType !== "scheduled" ||
      (!!data.scheduledTime && new Date(data.scheduledTime) > new Date()),
    { message: "Pick a scheduled time in the future", path: ["scheduledTime"] }
  );

export type CheckoutInput = z.infer<typeof checkoutSchema>;
