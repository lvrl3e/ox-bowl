const steps = [
  {
    title: "Order online",
    body: "Browse the menu, add items, choose pickup or delivery.",
    icon: (
      <path
        d="M4 7h16l-1.5 11.2A2 2 0 0 1 16.52 20H7.48a2 2 0 0 1-1.98-1.8L4 7Z M8 7a4 4 0 1 1 8 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Pay your way",
    body: "Cash on pickup/delivery, or scan our QR to pay now.",
    icon: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 10h16" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7.5 14.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "We prep it fresh",
    body: "You'll see your order move from Received to Preparing.",
    icon: (
      <path
        d="M12 3c1.5 2 1.5 3.3.5 4.5C11.3 8.8 11 10 12 11c1-1 1.8-1.2 2.5-.5 1.3 1.3 1.5 3.8-.5 5.8A4.2 4.2 0 0 1 11 17.5a5 5 0 0 1-5-5c0-3.2 3.3-6.5 6-9.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Pickup or delivered",
    body: "Track status anytime with your order number.",
    icon: (
      <>
        <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M5 18h-.5A1.5 1.5 0 0 1 3 16.5V13l1.5-4.5A2 2 0 0 1 6.4 7H13l3 5h2.5A1.5 1.5 0 0 1 20 13.5v3a1.5 1.5 0 0 1-1.5 1.5H15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M9 18h6" stroke="currentColor" strokeWidth="1.6" />
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="max-w-[1280px] mx-auto px-5 py-10">
      <div className="relative inline-block">
        <h2 className="relative z-10 -skew-x-6 bg-red text-cream font-heading text-2xl sm:text-[28px] px-5 py-1.5 rounded-sm shadow-[0_6px_16px_rgba(200,16,46,0.35)]">
          <span className="inline-block skew-x-6">How to Order</span>
        </h2>
        <span
          aria-hidden="true"
          className="absolute left-1.5 -bottom-1.5 h-2 w-2/3 bg-gold/70 blur-[3px]"
        />
      </div>
      <div
        className="mt-5 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
      >
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="relative bg-bg2 rounded-card p-4 border border-line transition-colors hover:border-gold/50"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-red/15 text-red">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {step.icon}
                </svg>
              </div>
              <span className="font-heading text-gold/80 text-sm">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="font-heading normal-case text-cream text-base mt-3">{step.title}</p>
            <p className="text-muted text-sm font-body mt-1">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
