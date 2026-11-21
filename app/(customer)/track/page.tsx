"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
      <h1 className="font-heading text-gold text-[32px]">Track your order</h1>
      <p className="text-muted font-body mt-2">
        Enter the order number from your confirmation (e.g. OB-1001).
      </p>
      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <input
          required
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="OB-1001"
          className="flex-1 bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted"
        />
        <button
          type="submit"
          className="rounded-btn bg-red text-white font-body font-semibold px-5 py-2.5 hover:bg-red-deep"
        >
          Track
        </button>
      </form>
    </div>
  );
}
