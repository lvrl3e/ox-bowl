import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ox Bowl Resto & Grill collects and uses your information.",
};

export default async function PrivacyPage() {
  const { settings } = await getSettings();

  return (
    <div className="max-w-[720px] mx-auto px-5 py-14">
      <h1 className="font-heading text-gold text-[32px] mb-1">Privacy Policy</h1>
      <p className="text-muted text-sm font-body mb-8">Last updated: November 24, 2026</p>

      <div className="flex flex-col gap-6 text-cream text-sm font-body leading-relaxed">
        <section>
          <p>
            This policy explains what information Ox Bowl Resto &amp; Grill
            (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects when you order
            through this site, and how it&rsquo;s used. We only use this
            information to run the restaurant and fulfill your orders — we
            don&rsquo;t sell it to anyone.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">
            Information we collect
          </h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>Your name and mobile number, to confirm and contact you about your order.</li>
            <li>Your delivery address and a landmark, if you choose delivery.</li>
            <li>The items you order, and any notes you add.</li>
            <li>
              If you pay by GCash, the screenshot of your payment and a
              reference number, used only to verify that payment went
              through.
            </li>
            <li>
              Basic analytics about how the site is used (pages visited,
              approximate location, device type) via Google Analytics and
              the Meta Pixel.
            </li>
            <li>
              Your cart contents, saved in your browser&rsquo;s local
              storage so it&rsquo;s there when you come back — this stays on
              your device and isn&rsquo;t sent to us until you check out.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">
            How we use it
          </h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>To prepare, fulfill, and deliver or hand over your order.</li>
            <li>To verify GCash payments before marking an order as paid.</li>
            <li>To contact you if there&rsquo;s a problem with your order.</li>
            <li>To look up and show you your past orders when you track them.</li>
            <li>To understand, in aggregate, how people use the site so we can improve it.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">
            Who can see it
          </h2>
          <p>
            Order details and payment screenshots are visible only to Ox
            Bowl staff and the owner, through a password-protected admin
            panel. Our data is hosted with Supabase; our site is hosted
            with Vercel. We don&rsquo;t share your personal information with
            any other third party.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">
            How long we keep it
          </h2>
          <p>
            We keep order records for our own bookkeeping. If you&rsquo;d
            like your personal information removed from our records,
            contact us using the details below and we&rsquo;ll take care of
            it.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Changes</h2>
          <p>
            If this policy changes, we&rsquo;ll update this page. Checking
            back occasionally is the best way to stay informed.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-gold text-lg mb-2">Contact us</h2>
          <p>
            Questions about your information? Reach us at{" "}
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
