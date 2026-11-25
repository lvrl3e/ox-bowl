"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a pageview on every client-side route change — the gtag/fbq
 * snippets below only cover the very first load, since Next's App
 * Router doesn't do full page reloads between pages.
 */
function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (GA_ID && window.gtag) {
      window.gtag("config", GA_ID, { page_path: pathname });
    }
    if (PIXEL_ID && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}

/**
 * No-ops entirely if neither env var is set — safe to render
 * unconditionally in the customer layout even before either account
 * is actually created.
 */
export default function Analytics() {
  if (!GA_ID && !PIXEL_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="fb-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
      <PageviewTracker />
    </>
  );
}
