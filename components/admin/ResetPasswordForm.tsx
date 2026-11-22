"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // Clicking the emailed link lands here with a recovery token in the
    // URL; createBrowserClient exchanges it for a session automatically
    // and fires this event once that's done.
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/login"), 1500);
  }

  if (done) {
    return (
      <p className="text-gold text-sm font-body">
        Password updated. Redirecting you to log in…
      </p>
    );
  }

  if (!ready) {
    return (
      <p className="text-muted text-sm font-body">
        This link is invalid or has expired. Request a new one from the{" "}
        <a href="/admin/forgot-password" className="underline underline-offset-2 hover:text-gold">
          forgot password
        </a>{" "}
        page.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full rounded-btn border border-line bg-bg text-cream font-body px-3 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
      />
      <input
        type="password"
        required
        minLength={8}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        className="w-full rounded-btn border border-line bg-bg text-cream font-body px-3 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
      />
      {error && <p className="text-red text-sm font-body">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:bg-line disabled:text-muted disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
