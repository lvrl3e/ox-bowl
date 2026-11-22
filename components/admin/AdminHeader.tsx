"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/account", label: "Account" },
];

export default function AdminHeader({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-line pb-4 mb-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 leading-tight shrink-0"
          aria-label="Ox Bowl Admin home"
        >
          <Image
            src="/icon-mark-64.png"
            alt=""
            aria-hidden="true"
            width={75}
            height={64}
            className="h-8 w-auto shrink-0"
          />
          <div>
            <p className="font-heading text-base leading-none">
              <span className="text-cream">OX</span>{" "}
              <span className="text-red">BOWL</span>
            </p>
            <p className="text-[9px] text-muted tracking-widest font-body">
              ADMIN
            </p>
          </div>
        </Link>

        <nav className="hidden sm:flex gap-2 flex-wrap">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-pill px-3 py-1.5 text-sm font-body font-semibold transition-colors",
                active === item.href
                  ? "bg-red text-white"
                  : "text-cream border border-line hover:bg-bg2 hover:border-gold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          className="sm:hidden rounded-btn border border-line text-cream w-11 h-11 flex items-center justify-center shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l14 14M19 5 5 19"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="sm:hidden flex flex-col gap-2 mt-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "rounded-btn px-3 py-2.5 text-sm font-body font-semibold transition-colors",
                active === item.href
                  ? "bg-red text-white"
                  : "text-cream border border-line hover:bg-bg2 hover:border-gold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
