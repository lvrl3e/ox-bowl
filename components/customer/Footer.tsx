import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/lib/types/database";
import { pickupMapUrl } from "@/lib/maps";

interface FooterProps {
  settings: Settings;
}

export default function Footer({ settings }: FooterProps) {
  const mapHref = pickupMapUrl(settings);

  return (
    <footer className="border-t border-line bg-bg2">
      <div className="max-w-[1280px] mx-auto px-5 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-heading text-cream text-lg flex items-center gap-2">
            <Image
              src="/icon-mark-64.png"
              alt=""
              aria-hidden="true"
              width={75}
              height={64}
              className="h-7 w-auto shrink-0"
            />
            <span>
              <span className="text-cream">OX</span> <span className="text-red">BOWL</span>
            </span>
          </p>
          <p className="text-muted text-sm font-body mt-2">
            Pickup &amp; delivery only — no dine-in.
          </p>
        </div>

        <div>
          <p className="font-heading text-gold text-sm">Visit / Pickup</p>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cream text-sm font-body mt-2 block hover:text-gold underline underline-offset-2"
          >
            {settings.pickup_address || "Address not set yet"}
          </a>
          {settings.store_phone && (
            <a
              href={`tel:${settings.store_phone}`}
              className="text-muted text-sm font-body mt-1 block hover:text-gold"
            >
              {settings.store_phone}
            </a>
          )}
        </div>

        <div>
          <p className="font-heading text-gold text-sm">Get in touch</p>
          {settings.store_messenger_url ? (
            <a
              href={settings.store_messenger_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cream text-sm font-body mt-2 block hover:text-gold underline underline-offset-2"
            >
              Facebook
            </a>
          ) : (
            <p className="text-muted text-sm font-body mt-2">
              Messenger link not set yet
            </p>
          )}
          <div className="flex gap-4 mt-3 text-sm font-body flex-wrap">
            <Link href="/track" className="text-muted hover:text-gold underline underline-offset-2">
              Track your order
            </Link>
            <Link href="/privacy" className="text-muted hover:text-gold underline underline-offset-2">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted hover:text-gold underline underline-offset-2">
              Terms
            </Link>
          </div>
        </div>
      </div>
      <p className="text-center text-muted text-xs font-body pb-6">
        © {new Date().getFullYear()} Ox Bowl Resto &amp; Grill. All rights reserved.
      </p>
    </footer>
  );
}
