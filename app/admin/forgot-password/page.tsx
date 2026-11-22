import type { Metadata } from "next";
import Link from "next/link";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[360px] rounded-card border border-line bg-bg2 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div className="h-1 bg-gradient-to-r from-red via-gold to-red" />
        <div className="p-6">
          <h1 className="font-heading text-cream text-xl mb-1">
            Forgot your password?
          </h1>
          <p className="text-muted text-xs font-body mb-4">
            Enter your email and we&rsquo;ll send you a reset link.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
      <Link
        href="/admin/login"
        className="mt-5 text-muted text-sm font-body underline underline-offset-2 hover:text-cream"
      >
        ← Back to login
      </Link>
    </div>
  );
}
