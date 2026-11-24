import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when you order from Ox Bowl Resto & Grill.",
};

export default async function TermsPage() {
  const { settings } = await getSettings();

  return (
    <div className="max-w-[720px] mx-auto px-5 py-14">
      <h1 className="font-heading text-gold text-[32px] mb-1">Terms of Service</h1>
      <p className="text-muted text-sm font-body mb-8">Last updated: November 24, 2026</p>

      <div className="flex flex-col gap-6 text-cream text-sm font-body leading-relaxed">
        <section>
          <p>
            By placing an order through this site, you&rsquo;re agreeing to
            the terms below. We&rsquo;re a small restaurant, so these are
            kept simple — if anything&rsquo;s unclear, just reach out.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Pickup &amp; delivery only</h2>
          <p>
            We don&rsquo;t offer dine-in. Every order is for pickup at our
            address or delivery within our serviceable radius. Please make
            sure the name, mobile number, and (for delivery) address and
            landmark you provide are accurate — we use these to reach you.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Menu, pricing &amp; availability</h2>
          <p>
            Prices and menu items can change without notice, and an item
            can sell out at any time. Items marked as requiring advance
            notice must be ordered the stated number of days ahead —
            we can&rsquo;t guarantee same-day orders for those.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Payment</h2>
          <p>
            We accept cash on pickup/delivery, or GCash via the QR code
            shown at checkout. For GCash payments, you upload a screenshot
            of your payment, which we manually verify — your order is
            confirmed as paid once that&rsquo;s checked, not automatically
            at checkout. If we can&rsquo;t verify a payment, we&rsquo;ll
            reach out to you directly.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Delivery fees &amp; timing</h2>
          <p>
            Delivery fees are based on distance from our store and are
            shown before you confirm your order. Preparation and delivery
            times are estimates, not guarantees — they can be affected by
            order volume, traffic, or weather.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Cancellations</h2>
          <p>
            You can cancel an order before we start preparing it by
            contacting us directly — once an order is marked preparing, we
            may not be able to cancel it since ingredients are already
            committed.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Changes to these terms</h2>
          <p>
            We may update these terms occasionally. Continuing to order
            through the site means you accept the current version posted
            here.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Contact us</h2>
          <p>
            Questions about an order or these terms? Reach us at{" "}
            {settings.store_phone ? (
              <a href={`tel:${settings.store_phone}`} className="text-gold underline underline-offset-2">
                {settings.store_phone}
              </a>
            ) : (
              "the phone number on our homepage"
            )}
            {settings.store_messenger_url && (
              <>
                {" "}or via{" "}
                <a
                  href={settings.store_messenger_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold underline underline-offset-2"
                >
                  Facebook Messenger
                </a>
              </>
            )}
            .
          </p>
        </section>
      </div>
    </div>
  );
}
