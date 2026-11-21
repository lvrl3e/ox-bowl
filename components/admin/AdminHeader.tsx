import Link from "next/link";
import clsx from "clsx";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminHeader({ active }: { active: string }) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <nav className="flex gap-2 flex-wrap">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "rounded-pill px-3 py-1.5 text-sm font-body font-semibold",
              active === item.href
                ? "bg-red text-white"
                : "text-cream border border-line hover:bg-bg2"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={logoutAction}>
        <button
          type="submit"
          className="rounded-btn border border-line text-cream font-body text-sm px-4 py-2.5 min-h-11 hover:bg-bg2 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
