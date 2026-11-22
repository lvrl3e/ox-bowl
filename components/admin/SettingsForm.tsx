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

function SectionHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-7 h-7 rounded-btn bg-red/15 text-red flex items-center justify-center shrink-0">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <h2 className="font-heading text-cream text-lg">{title}</h2>
    </div>
  );
}

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
  const [storeOpen, setStoreOpen] = useState(settings.store_open);

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
        className="flex flex-col gap-4 disabled:opacity-60"
      >
        <section
          className="relative overflow-hidden rounded-card border border-line bg-bg2 p-4"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 100% at 0% 0%, rgba(200,16,46,0.14), transparent 70%)",
          }}
        >
          <label className="flex items-center gap-3 text-cream font-body font-semibold cursor-pointer w-fit">
            <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
              <input
                type="checkbox"
                name="storeOpen"
                checked={storeOpen}
                onChange={(e) => setStoreOpen(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-pill bg-line peer-checked:bg-red transition-colors" />
              <span className="absolute left-1 h-5 w-5 rounded-full bg-cream transition-transform peer-checked:translate-x-5" />
            </span>
            <span className={storeOpen ? "text-gold" : "text-muted"}>
              {storeOpen ? "Store is open" : "Store is closed"}
            </span>
          </label>
        </section>

        <section className="rounded-card border border-line bg-bg2 p-4">
          <SectionHeading
            title="Operating hours"
            icon={
              <>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </>
            }
          />
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
                  <div className="flex items-center gap-2 bg-bg border border-line rounded-btn px-2.5 py-1.5 w-fit">
                    <input
                      type="time"
                      name={`open_${day.key}`}
                      defaultValue={hours?.open ?? "10:00"}
                      className="bg-transparent text-cream text-sm font-body w-auto focus:outline-none"
                    />
                    <span className="text-muted text-xs font-body">to</span>
                    <input
                      type="time"
                      name={`close_${day.key}`}
                      defaultValue={hours?.close ?? "21:00"}
                      className="bg-transparent text-cream text-sm font-body w-auto focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-card border border-line bg-bg2 p-4 flex flex-col gap-2">
          <SectionHeading
            title="Delivery & minimum order"
            icon={
              <>
                <rect x="2.5" y="8" width="11" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" />
                <path d="M13.5 11h3.5l3 3v2h-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="7" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
                <circle cx="17" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.6" />
              </>
            }
          />
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

        <section className="rounded-card border border-line bg-bg2 p-4 flex flex-col gap-2">
          <SectionHeading
            title="Pickup location"
            icon={
              <>
                <path d="M12 21s-7-6.5-7-11.5a7 7 0 1 1 14 0C19 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
              </>
            }
          />
          <label className="text-muted text-xs font-body">
            Address
            <input
              name="pickupAddress"
              defaultValue={settings.pickup_address}
              className={inputClass}
            />
          </label>
        </section>

        <section className="rounded-card border border-line bg-bg2 p-4 flex flex-col gap-2">
          <SectionHeading
            title="Contact"
            icon={
              <path
                d="M4.5 4.5h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3 5.6a1.5 1.5 0 0 1 1.5-1.1Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            }
          />
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

        <section className="rounded-card border border-line bg-bg2 p-4 flex flex-col gap-2">
          <SectionHeading
            title="QR payment"
            icon={
              <>
                <rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
                <rect x="14.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
                <rect x="3.5" y="14.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.6" />
                <path d="M14.5 14.5h2.5v2.5M20 14.5v2.5h-2.5M14.5 20h2.5M20 20v-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            }
          />
          {settings.qr_image_path && (
            <div className="relative w-32 h-32 bg-bg rounded-btn border border-line">
              <Image
                src={publicStorageUrl("assets", settings.qr_image_path)}
                alt="Current QR code"
                fill
                className="object-contain p-2"
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

        <section className="rounded-card border border-line bg-bg2 p-4">
          <SectionHeading
            title="Owner notifications"
            icon={
              <path
                d="M12 3a5 5 0 0 0-5 5v3.5L5 15h14l-2-3.5V8a5 5 0 0 0-5-5Z M9.5 18a2.5 2.5 0 0 0 5 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            }
          />
          <label className="text-muted text-xs font-body">
            Telegram chat id for new-order alerts
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
