import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/admin") ? next : "/admin";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-16 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,16,46,0.25), transparent 70%), radial-gradient(ellipse 50% 40% at 100% 100%, rgba(245,197,24,0.08), transparent 70%)",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--cream) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative flex flex-col items-center animate-fade-in-up">
        <Link
          href="/"
          className="mb-6"
          aria-label="Ox Bowl Resto & Grill home"
        >
          <Image
            src="/logo.png"
            alt="Ox Bowl Resto & Grill"
            width={233}
            height={256}
            priority
            className="h-28 sm:h-32 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          />
        </Link>

        <div className="w-full max-w-[400px] rounded-card border border-line bg-bg2 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="h-1 bg-gradient-to-r from-red via-gold to-red" />

          <div className="p-6 sm:p-8">
            <span className="inline-block rounded-pill bg-red/15 text-red text-[11px] font-body font-semibold tracking-wide px-3 py-1 mb-4">
              OWNER &amp; STAFF ACCESS
            </span>

            <h1 className="font-heading text-cream text-2xl mb-1">
              Admin Sign In
            </h1>
            <p className="text-muted text-sm font-body mb-6">
              Enter your credentials to manage orders, menu, and settings.
            </p>

            <LoginForm next={safeNext} />

            <div className="flex items-center gap-2 mt-6 pt-5 border-t border-line text-muted text-xs font-body">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="flex-shrink-0"
              >
                <rect
                  x="5"
                  y="10.5"
                  width="14"
                  height="9"
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
              <span>Access is limited to Ox Bowl owners &amp; staff.</span>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 text-muted text-sm font-body underline underline-offset-2 hover:text-cream"
        >
          ← Back to the menu
        </Link>
      </div>
    </div>
  );
}
