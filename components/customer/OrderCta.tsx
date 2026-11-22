import Link from "next/link";

interface OrderCtaProps {
  phone: string;
  messengerUrl: string;
}

export default function OrderCta({ phone, messengerUrl }: OrderCtaProps) {
  return (
    <section className="max-w-[1280px] mx-auto px-5 pb-10">
      <div className="relative overflow-hidden rounded-pill bg-gradient-to-r from-red-deep via-red to-red-deep border border-gold/40 shadow-[0_8px_24px_rgba(200,16,46,0.35)] px-5 sm:px-8 py-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <div aria-hidden="true" className="bg-grill-lines absolute inset-0 pointer-events-none" />
        <div className="relative flex items-center gap-2 text-white font-heading text-sm sm:text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16l-1.5 11.2A2 2 0 0 1 16.52 20H7.48a2 2 0 0 1-1.98-1.8L4 7Z M8 7a4 4 0 1 1 8 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          Take out &amp; delivery only
        </div>

        <div className="h-6 w-px bg-white/30 hidden sm:block" aria-hidden="true" />

        <div className="flex items-center gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label="Call us"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.5 2.3.8 3.6.8.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.4 21.2 2.8 13.6 2.8 4c0-.6.4-1 1-1H7.2c.6 0 1 .4 1 1 0 1.3.3 2.5.8 3.6.2.3.1.7-.2 1L6.6 10.8Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
          {messengerUrl && (
            <a
              href={messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Message us on Facebook"
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.6A7.96 7.96 0 0 1 4 12Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
        </div>

        <div className="h-6 w-px bg-white/30 hidden sm:block" aria-hidden="true" />

        <Link
          href="/order"
          className="group/btn relative flex items-center gap-2 rounded-pill bg-gold text-bg font-heading text-base sm:text-lg px-5 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.35)] transition-transform hover:scale-105 active:scale-95 animate-order-pulse"
        >
          Order Now!
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-transform group-hover/btn:translate-x-1"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
