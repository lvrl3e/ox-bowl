"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-gold text-sm font-body">
        If an account exists for that email, a reset link is on its way. Check
        your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@oxbowl.com"
        className="w-full rounded-btn border border-line bg-bg text-cream font-body px-3 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
      />
      {error && <p className="text-red text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:bg-line disabled:text-muted disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
