import Link from "next/link";
import clsx from "clsx";

const TABS = [
  { href: "/admin/orders", label: "Board" },
  { href: "/admin/orders/history", label: "History" },
] as const;

export default function OrdersTabs({ active }: { active: "/admin/orders" | "/admin/orders/history" }) {
  return (
    <div className="flex gap-2 mb-6">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={clsx(
            "rounded-pill px-3 py-1.5 text-sm font-body font-semibold transition-colors",
            active === tab.href
              ? "bg-red text-white"
              : "text-cream border border-line hover:bg-bg2 hover:border-gold"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
