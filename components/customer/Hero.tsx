interface HeroProps {
  todayHoursLabel: string;
}

export default function Hero({ todayHoursLabel }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,16,46,0.25), transparent 70%)",
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 9px)",
        ].join(", "),
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative max-w-[1280px] mx-auto px-5 py-14 sm:py-20 text-center">
        <span className="inline-flex items-center gap-2 text-gold text-xs font-body font-semibold tracking-[0.2em] uppercase">
          <span className="h-px w-6 bg-gold/60" />
          Filipino Comfort Food
          <span className="h-px w-6 bg-gold/60" />
        </span>

        <h1 className="mt-3 font-heading font-bold text-cream text-[38px] sm:text-[56px] lg:text-[72px] leading-[1.05]">
          Crispy sa Unang Kagat,
          <br />
          <span className="text-gold">Sulit Hanggang Huling Subo!</span>
        </h1>
        <p className="mt-4 text-muted max-w-md mx-auto text-base">
          Filipino chicken, pork, beef &amp; seafood favorites, cooked to
          order. Pickup or delivery — no dine-in.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <span className="rounded-pill bg-red text-white text-[13px] font-body px-4 py-1.5 shadow-[0_4px_14px_rgba(200,16,46,0.35)]">
            Take out &amp; delivery only
          </span>
          <span className="rounded-pill bg-bg2 border border-gold/40 text-gold text-[13px] font-body px-4 py-1.5">
            {todayHoursLabel}
          </span>
        </div>
      </div>

      <svg
        aria-hidden="true"
        viewBox="0 0 1000 24"
        preserveAspectRatio="none"
        className="relative block w-full h-5 text-bg2"
      >
        <path
          d="M0 24 L0 10 Q 41.6 24 83.3 10 T 166.6 10 T 250 10 T 333.3 10 T 416.6 10 T 500 10 T 583.3 10 T 666.6 10 T 750 10 T 833.3 10 T 916.6 10 T 1000 10 L1000 24 Z"
          fill="currentColor"
        />
      </svg>
    </section>
  );
}
