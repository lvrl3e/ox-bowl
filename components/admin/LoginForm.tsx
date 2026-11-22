"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, type LoginActionState } from "@/app/admin/login/actions";

const initialState: LoginActionState = { error: null };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="w-full space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="email"
          className="block text-muted text-sm font-body mb-1.5"
        >
          Email
        </label>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <path
              d="M4 6h16v12H4V6Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M4.5 6.5 12 13l7.5-6.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@oxbowl.com"
            className="w-full rounded-btn border border-line bg-bg text-cream font-body pl-10 pr-3 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-muted text-sm font-body mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <rect
              x="5"
              y="10.5"
              width="14"
              height="9.5"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M8 10.5V7.5a4 4 0 0 1 8 0v3"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-btn border border-line bg-bg text-cream font-body pl-10 pr-10 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-cream transition-colors"
          >
            {showPassword ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 3l18 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path
                  d="M10.6 5.2A10.7 10.7 0 0 1 12 5c5 0 9 4.5 10 7-0.4 1-1.3 2.4-2.6 3.7M6.7 6.7C4.6 8 3.2 10 2 12c1 2.5 5 7 10 7 1.5 0 2.9-.4 4.1-1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            )}
          </button>
        </div>
        <Link
          href="/admin/forgot-password"
          className="mt-1.5 inline-block text-muted text-xs font-body underline underline-offset-2 hover:text-gold"
        >
          Forgot password?
        </Link>
      </div>

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-btn border border-red/30 bg-red/10 text-red text-sm font-body px-3 py-2.5"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="mt-0.5 flex-shrink-0"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.9" fill="currentColor" />
          </svg>
          <span>{state.error}</span>
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-btn bg-red text-white font-body font-semibold py-3 min-h-11 hover:bg-red-deep disabled:bg-line disabled:text-muted disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
