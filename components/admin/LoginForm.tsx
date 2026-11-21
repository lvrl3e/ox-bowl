"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/app/admin/login/actions";

const initialState: LoginActionState = { error: null };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );

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
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-btn border border-line bg-bg text-cream font-body pl-10 pr-3 py-2.5 min-h-11 placeholder:text-muted/60 focus:outline-none focus:border-gold transition-colors"
          />
        </div>
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
