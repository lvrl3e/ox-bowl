// Sample reviews — placeholder copy until real customer feedback is collected.
const reviews = [
  {
    name: "Jerico M.",
    order: "Giant Chicken Leg Quarter",
    rating: 5,
    quote:
      "Sulit talaga! Crispy pa rin pagdating sa bahay, hindi na-soggy. Order na order kami kapag may overtime.",
  },
  {
    name: "Angela R.",
    order: "Crispy Pata",
    rating: 5,
    quote:
      "Best crispy pata sa area namin. Yung skin crunchy, karne naman super lambot. Worth it yung advance order wait.",
  },
  {
    name: "Mark D.",
    order: "Chicken Wings",
    rating: 4,
    quote:
      "Masarap yung sauce, hindi sobrang tamis. Mabilis din dumating, mga 30 minutes lang from order.",
  },
  {
    name: "Cristine L.",
    order: "Lechon Belly",
    rating: 5,
    quote:
      "Pinaorder namin to para sa birthday ng tatay ko, bongga! Lahat nag-request ulit sa susunod na family gathering.",
  },
];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.3 6.1 20.6l1.4-6.6-5-4.6 6.6-.7Z"
        fill={filled ? "#f5c518" : "none"}
        stroke="#f5c518"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Reviews() {
  return (
    <section className="max-w-[1000px] mx-auto px-5 py-10">
      <div className="relative inline-block">
        <h2 className="relative z-10 -skew-x-6 bg-red text-cream font-heading text-2xl sm:text-[28px] px-5 py-1.5 rounded-sm shadow-[0_6px_16px_rgba(200,16,46,0.35)]">
          <span className="inline-block skew-x-6">What People Say</span>
        </h2>
        <span
          aria-hidden="true"
          className="absolute left-1.5 -bottom-1.5 h-2 w-2/3 bg-gold/70 blur-[3px]"
        />
      </div>
      <p className="mt-3 text-muted text-sm font-body">
        Sample reviews — real customer feedback coming soon.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <div
            key={r.name}
            className="bg-bg2 rounded-card border border-line p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} filled={i < r.rating} />
              ))}
            </div>
            <p className="text-cream text-sm font-body leading-relaxed">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-auto pt-1 flex items-center justify-between gap-2">
              <span className="font-heading normal-case text-cream text-sm">{r.name}</span>
              <span className="text-muted text-xs font-body">{r.order}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
