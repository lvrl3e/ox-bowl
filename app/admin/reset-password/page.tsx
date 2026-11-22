import type { Metadata } from "next";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[360px] rounded-card border border-line bg-bg2 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
        <div className="h-1 bg-gradient-to-r from-red via-gold to-red" />
        <div className="p-6">
          <h1 className="font-heading text-cream text-xl mb-4">
            Set a new password
          </h1>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
