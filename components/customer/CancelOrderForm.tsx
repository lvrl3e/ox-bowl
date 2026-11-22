"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CancelOrderResult {
  success: boolean;
  error?: string;
}

export default function CancelOrderForm({ orderNumber }: { orderNumber: string }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCancel(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("cancel_order", {
      p_order_number: orderNumber,
      p_mobile: mobile,
    });

    setPending(false);

    if (rpcError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    const result = data as CancelOrderResult;
    if (!result.success) {
      setError(result.error ?? "Unable to cancel this order.");
      return;
    }

    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-red text-sm font-body underline underline-offset-2 hover:text-red-deep"
      >
        Cancel this order
      </button>
    );
  }

  return (
    <form
      onSubmit={handleCancel}
      className="mt-4 bg-bg2 border border-line rounded-card p-4 flex flex-col gap-3"
    >
      <p className="text-cream text-sm font-body font-semibold">
        Cancel this order?
      </p>
      <p className="text-muted text-xs font-body">
        Confirm the mobile number you used at checkout.
      </p>
      <input
        type="tel"
        required
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        placeholder="09xx xxx xxxx"
        className="bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted"
      />
      {error && <p className="text-red text-xs font-body">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-btn bg-red text-white font-body font-semibold text-sm px-4 py-2.5 min-h-11 hover:bg-red-deep disabled:opacity-60"
        >
          {pending ? "Cancelling…" : "Yes, cancel order"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-btn border border-line text-cream font-body font-semibold text-sm px-4 py-2.5 min-h-11 hover:bg-bg"
        >
          Never mind
        </button>
      </div>
    </form>
  );
}
