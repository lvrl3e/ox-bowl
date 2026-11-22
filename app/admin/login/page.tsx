import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(safeNext);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
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
          className="mb-3"
          aria-label="Ox Bowl Resto & Grill home"
        >
          <Image
            src="/logo.png"
            alt="Ox Bowl Resto & Grill"
            width={233}
            height={256}
            priority
            className="h-20 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          />
        </Link>

        <div className="w-full max-w-[420px] rounded-card border border-line bg-bg2 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <div className="h-1 bg-gradient-to-r from-red via-gold to-red" />

          <div className="p-8">
            <span className="inline-block rounded-pill bg-red/15 text-red text-[11px] font-body font-semibold tracking-wide px-3 py-1 mb-4">
              OWNER &amp; STAFF ACCESS
            </span>

            <h1 className="font-heading text-cream text-2xl mb-4">
              Admin Sign In
            </h1>

            <LoginForm next={safeNext} />
          </div>
        </div>
      </div>
    </div>
  );
}
