"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import {
  updateSettingsAction,
  type SettingsActionState,
} from "@/app/admin/settings/actions";
import { publicStorageUrl } from "@/lib/supabase/storage";
import type { Settings } from "@/lib/types/database";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted";

interface SettingsFormProps {
  settings: Settings;
  isOwner: boolean;
}

const initialState: SettingsActionState = { error: null, success: false };

export default function SettingsForm({ settings, isOwner }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initialState
  );
  const [qrFileName, setQrFileName] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {!isOwner && (
        <p className="text-gold text-sm font-body bg-bg2 border border-line rounded-btn p-3">
          You&rsquo;re signed in as staff — settings are read-only. Ask an
          owner to make changes.
        </p>
      )}

      <fieldset
        disabled={!isOwner}
        className="flex flex-col gap-6 disabled:opacity-60"
      >
        <section>
          <label className="flex items-center gap-2 text-cream font-body font-semibold">
            <input
              type="checkbox"
              name="storeOpen"
              defaultChecked={settings.store_open}
              className="w-5 h-5"
            />
            Store is open for orders
          </label>
        </section>

        <section>
          <h2 className="font-heading text-cream text-lg mb-2">
            Operating hours
          </h2>
          <div className="flex flex-col gap-2">
            {DAYS.map((day) => {
              const hours = settings.operating_hours[day.key];
              return (
                <div key={day.key} className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted text-sm font-body w-24">
                    {day.label}
                  </span>
                  <label className="flex items-center gap-1 text-xs text-muted font-body">
                    <input
                      type="checkbox"
                      name={`closed_${day.key}`}
                      defaultChecked={!hours}
                      className="w-4 h-4"
                    />
                    Closed
                  </label>
                  <input
                    type="time"
                    name={`open_${day.key}`}
                    defaultValue={hours?.open ?? "10:00"}
                    className={`${inputClass} w-auto`}
                  />
                  <span className="text-muted text-xs">to</span>
                  <input
                    type="time"
                    name={`close_${day.key}`}
                    defaultValue={hours?.close ?? "21:00"}
                    className={`${inputClass} w-auto`}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-cream text-lg mb-1">
            Delivery &amp; minimum order
          </h2>
          <label className="text-muted text-xs font-body">
            Base delivery fee (₱)
            <input
              type="number"
              step="0.01"
              min="0"
              name="deliveryFeeBase"
              defaultValue={settings.delivery_fee_base}
              className={inputClass}
            />
          </label>
          <label className="text-muted text-xs font-body">
            Delivery fee per km (₱)
            <input
              type="number"
              step="0.01"
              min="0"
              name="deliveryFeePerKm"
              defaultValue={settings.delivery_fee_per_km}
              className={inputClass}
            />
          </label>
          <label className="text-muted text-xs font-body">
            Max delivery distance (km)
            <input
              type="number"
              step="0.1"
              min="0"
              name="deliveryMaxKm"
              defaultValue={settings.delivery_max_km}
              className={inputClass}
            />
          </label>
          <label className="text-muted text-xs font-body">
            Minimum order amount (₱)
            <input
              type="number"
              step="0.01"
              min="0"
              name="minOrderAmount"
              defaultValue={settings.min_order_amount}
              className={inputClass}
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-cream text-lg mb-1">
            Pickup location
          </h2>
          <label className="text-muted text-xs font-body">
            Address
            <input
              name="pickupAddress"
              defaultValue={settings.pickup_address}
              className={inputClass}
            />
          </label>
          <div className="flex gap-2">
            <label className="text-muted text-xs font-body flex-1">
              Latitude
              <input
                type="number"
                step="any"
                name="pickupLat"
                defaultValue={settings.pickup_lat ?? ""}
                className={inputClass}
              />
            </label>
            <label className="text-muted text-xs font-body flex-1">
              Longitude
              <input
                type="number"
                step="any"
                name="pickupLng"
                defaultValue={settings.pickup_lng ?? ""}
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-cream text-lg mb-1">Contact</h2>
          <label className="text-muted text-xs font-body">
            Store phone
            <input
              name="storePhone"
              defaultValue={settings.store_phone}
              className={inputClass}
            />
          </label>
          <label className="text-muted text-xs font-body">
            Messenger link
            <input
              name="storeMessengerUrl"
              defaultValue={settings.store_messenger_url}
              className={inputClass}
            />
          </label>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-cream text-lg mb-1">
            QR payment
          </h2>
          {settings.qr_image_path && (
            <div className="relative w-32 h-32">
              <Image
                src={publicStorageUrl("assets", settings.qr_image_path)}
                alt="Current QR code"
                fill
                className="object-contain"
              />
            </div>
          )}
          <div>
            <p className="text-muted text-xs font-body mb-1">
              Replace QR image
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => qrInputRef.current?.click()}
                disabled={!isOwner}
                className="rounded-btn border border-line text-cream text-sm font-body font-semibold px-4 py-2.5 min-h-11 hover:bg-red hover:border-red hover:text-white transition-colors disabled:cursor-not-allowed"
              >
                Choose file
              </button>
              <span className="text-muted text-xs font-body truncate">
                {qrFileName ?? "No file selected"}
              </span>
            </div>
            <input
              ref={qrInputRef}
              type="file"
              name="qrImage"
              accept="image/*"
              onChange={(e) => setQrFileName(e.target.files?.[0]?.name ?? null)}
              className="sr-only"
            />
          </div>
          <label className="text-muted text-xs font-body">
            Account name
            <input
              name="qrAccountName"
              defaultValue={settings.qr_account_name}
              className={inputClass}
            />
          </label>
          <label className="text-muted text-xs font-body">
            Account number
            <input
              name="qrAccountNumber"
              defaultValue={settings.qr_account_number}
              className={inputClass}
            />
          </label>
        </section>

        <section>
          <label className="text-muted text-xs font-body">
            Telegram chat id for new-order alerts (not wired up yet)
            <input
              name="notifyTelegramChatId"
              defaultValue={settings.notify_telegram_chat_id}
              className={inputClass}
            />
          </label>
        </section>
      </fieldset>

      {state.error && (
        <p className="text-red text-sm font-body">{state.error}</p>
      )}
      {state.success && (
        <p className="text-gold text-sm font-body">Settings saved.</p>
      )}

      {isOwner && (
        <button
          type="submit"
          disabled={pending}
          className="rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
      )}
    </form>
  );
}
