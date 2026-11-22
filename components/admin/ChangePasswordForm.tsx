"use client";

import { useActionState } from "react";
import { changePasswordAction, type ChangePasswordState } from "@/app/admin/account/actions";

const initialState: ChangePasswordState = { error: null, success: false };

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 bg-bg2 border border-line rounded-card p-4 max-w-[360px]"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-btn bg-red/15 text-red flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        <h2 className="font-heading text-cream text-lg">Change password</h2>
      </div>

      <label className="text-muted text-xs font-body">
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </label>
      <label className="text-muted text-xs font-body">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </label>

      {state.error && <p className="text-red text-sm font-body">{state.error}</p>}
      {state.success && (
        <p className="text-gold text-sm font-body">Password updated.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-btn bg-red text-white font-body font-semibold py-2.5 min-h-11 hover:bg-red-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}
