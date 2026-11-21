"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useCartStore, cartSubtotal } from "@/store/cart";
import { useHasHydrated } from "@/lib/use-has-hydrated";
import { formatPeso } from "@/lib/format";
import { publicStorageUrl } from "@/lib/supabase/storage";
import { pickupMapUrl } from "@/lib/maps";
import type { Settings } from "@/lib/types/database";

interface CheckoutFormProps {
  settings: Settings;
}

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted";

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex-1 rounded-btn border px-4 py-2.5 text-sm font-body font-semibold min-h-11 transition-colors",
        active
          ? "bg-red border-red text-white"
          : "border-line text-cream hover:bg-red hover:border-red hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

export default function CheckoutForm({ settings }: CheckoutFormProps) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useHasHydrated();
  const router = useRouter();

  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [scheduleType, setScheduleType] = useState<"asap" | "scheduled">("asap");
  const [scheduledTime, setScheduledTime] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qr">("cash");
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = cartSubtotal(items);
  const deliveryFee = fulfillmentType === "delivery" ? settings.delivery_fee_base : 0;
  const total = subtotal + deliveryFee;
  const belowMinimum =
    settings.min_order_amount > 0 && subtotal < settings.min_order_amount;

  if (!hydrated) {
    return (
      <p className="text-muted font-body text-sm px-5 py-16 text-center">
        Loading…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-5 py-16 text-center">
        <h1 className="font-heading text-gold text-[32px]">Checkout</h1>
        <p className="text-muted font-body mt-3">Your cart is empty.</p>
        <a
          href="/order"
          className="inline-block mt-6 rounded-btn bg-red text-white font-body font-semibold px-6 py-3 hover:bg-red-deep"
        >
          Browse the menu
        </a>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (belowMinimum) {
      setError(`Minimum order is ${formatPeso(settings.min_order_amount)}.`);
      return;
    }

    const payload = {
      fulfillmentType,
      customerName,
      customerMobile,
      scheduleType,
      scheduledTime:
        scheduleType === "scheduled" && scheduledTime
          ? new Date(scheduledTime).toISOString()
          : null,
      deliveryAddress: fulfillmentType === "delivery" ? deliveryAddress : undefined,
      deliveryLandmark: fulfillmentType === "delivery" ? deliveryLandmark : undefined,
      notes: notes || undefined,
      paymentMethod,
      paymentReferenceNumber:
        paymentMethod === "qr" ? paymentReferenceNumber : undefined,
      items: items.map((i) => ({
        itemId: i.itemId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    const body = new FormData();
    body.set("payload", JSON.stringify(payload));
    if (paymentMethod === "qr" && screenshot) {
      body.set("screenshot", screenshot);
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Unable to place order");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/track/${data.orderNumber}`);
    } catch {
      setError("Network error — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-5 py-10">
      <h1 className="font-heading text-gold text-[32px] border-l-4 border-red pl-3 leading-none">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <section className="bg-bg2 rounded-card border border-line p-4">
          <h2 className="font-heading text-cream text-lg mb-2">Your order</h2>
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.key}
                className="py-2 flex justify-between gap-3 text-sm font-body"
              >
                <span className="text-cream">
                  {item.quantity}× {item.name}
                  {item.variantLabel && (
                    <span className="text-muted"> ({item.variantLabel})</span>
                  )}
                </span>
                <span className="text-gold shrink-0">
                  {formatPeso(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="pt-3 mt-2 border-t border-line flex flex-col gap-1 text-sm font-body">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPeso(subtotal)}</span>
            </div>
            {fulfillmentType === "delivery" && (
              <div className="flex justify-between text-muted">
                <span>Delivery fee</span>
                <span>{formatPeso(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-cream font-semibold text-base pt-1">
              <span>Total</span>
              <span className="text-gold">{formatPeso(total)}</span>
            </div>
          </div>
          {belowMinimum && (
            <p className="text-red text-xs font-body mt-2">
              Minimum order is {formatPeso(settings.min_order_amount)}.
            </p>
          )}
        </section>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-cream text-base mb-1">
            Fulfillment
          </legend>
          <div className="flex gap-2">
            <ToggleButton
              active={fulfillmentType === "pickup"}
              onClick={() => setFulfillmentType("pickup")}
            >
              Pickup
            </ToggleButton>
            <ToggleButton
              active={fulfillmentType === "delivery"}
              onClick={() => setFulfillmentType("delivery")}
            >
              Delivery
            </ToggleButton>
          </div>
          {fulfillmentType === "pickup" ? (
            <p className="text-muted text-xs font-body mt-1">
              Pickup at:{" "}
              {settings.pickup_address ? (
                <a
                  href={pickupMapUrl(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline underline-offset-2 hover:text-cream"
                >
                  {settings.pickup_address}
                </a>
              ) : (
                "Address not set yet"
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <input
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Delivery address"
                className={inputClass}
              />
              <input
                value={deliveryLandmark}
                onChange={(e) => setDeliveryLandmark(e.target.value)}
                placeholder="Landmark (optional)"
                className={inputClass}
              />
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-cream text-base mb-1">
            Contact details
          </legend>
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
          <input
            required
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            placeholder="Mobile number (09xxxxxxxxx)"
            className={inputClass}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-cream text-base mb-1">
            When
          </legend>
          <div className="flex gap-2">
            <ToggleButton
              active={scheduleType === "asap"}
              onClick={() => setScheduleType("asap")}
            >
              As soon as possible
            </ToggleButton>
            <ToggleButton
              active={scheduleType === "scheduled"}
              onClick={() => setScheduleType("scheduled")}
            >
              Schedule for later
            </ToggleButton>
          </div>
          {scheduleType === "scheduled" && (
            <input
              required
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className={clsx(inputClass, "mt-1")}
            />
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-cream text-base mb-1">
            Notes (optional)
          </legend>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, special requests, gate code, etc."
            rows={3}
            className={inputClass}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-heading text-cream text-base mb-1">
            Payment
          </legend>
          <div className="flex gap-2">
            <ToggleButton
              active={paymentMethod === "cash"}
              onClick={() => setPaymentMethod("cash")}
            >
              Cash on {fulfillmentType === "pickup" ? "pickup" : "delivery"}
            </ToggleButton>
            <ToggleButton
              active={paymentMethod === "qr"}
              onClick={() => setPaymentMethod("qr")}
            >
              Pay via QR
            </ToggleButton>
          </div>

          {paymentMethod === "qr" && (
            <div className="bg-bg2 rounded-card border border-line p-4 mt-1 flex flex-col gap-3">
              {settings.qr_image_path ? (
                <div className="relative w-40 h-40 mx-auto">
                  <Image
                    src={publicStorageUrl("assets", settings.qr_image_path)}
                    alt="Payment QR code"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <p className="text-muted text-xs font-body text-center">
                  QR code not set up yet — contact the store.
                </p>
              )}
              {settings.qr_account_name && (
                <p className="text-cream text-sm font-body text-center">
                  {settings.qr_account_name} · {settings.qr_account_number}
                </p>
              )}
              <input
                value={paymentReferenceNumber}
                onChange={(e) => setPaymentReferenceNumber(e.target.value)}
                placeholder="Reference number"
                className={inputClass}
              />
              <div>
                <p className="text-muted text-xs font-body mb-1">
                  Screenshot of payment
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    className="rounded-btn border border-line text-cream text-sm font-body font-semibold px-4 py-2.5 min-h-11 hover:bg-red hover:border-red hover:text-white transition-colors"
                  >
                    Choose file
                  </button>
                  <span className="text-muted text-xs font-body truncate">
                    {screenshot ? screenshot.name : "No file selected"}
                  </span>
                </div>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </div>
            </div>
          )}
        </fieldset>

        {error && (
          <p className="text-red text-sm font-body text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || belowMinimum}
          className="rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:bg-line disabled:text-muted disabled:cursor-not-allowed"
        >
          {submitting ? "Placing order…" : `Place order · ${formatPeso(total)}`}
        </button>
      </form>
    </div>
  );
}
