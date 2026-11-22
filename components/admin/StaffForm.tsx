"use client";

import { useActionState } from "react";
import { addStaffAction, type AddStaffState } from "@/app/admin/staff/actions";

const initialState: AddStaffState = { error: null, success: false };

const inputClass =
  "w-full bg-bg border border-line rounded-btn p-2.5 text-cream text-sm font-body placeholder:text-muted";

export default function StaffForm({ isOwner }: { isOwner: boolean }) {
  const [state, formAction, pending] = useActionState(addStaffAction, initialState);

  if (!isOwner) {
    return (
      <p className="text-gold text-sm font-body bg-bg2 border border-line rounded-btn p-3">
        You&rsquo;re signed in as staff — only the owner can add new staff.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 bg-bg2 border border-line rounded-card overflow-hidden p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-7 h-7 rounded-btn bg-red/15 text-red flex items-center justify-center shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="font-heading text-cream text-lg">Add staff</h2>
      </div>

      <label className="text-muted text-xs font-body">
        Name
        <input name="name" required className={inputClass} />
      </label>
      <label className="text-muted text-xs font-body">
        Email
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="text-muted text-xs font-body">
        Temporary password
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </label>
      <label className="text-muted text-xs font-body">
        Role
        <select name="role" defaultValue="staff" className={inputClass}>
          <option value="staff">Staff</option>
          <option value="owner">Owner</option>
        </select>
      </label>

      {state.error && <p className="text-red text-sm font-body">{state.error}</p>}
      {state.success && (
        <p className="text-gold text-sm font-body">Staff account created.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-btn bg-red text-white font-body font-semibold py-2.5 min-h-11 hover:bg-red-deep disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add staff"}
      </button>
    </form>
  );
}
