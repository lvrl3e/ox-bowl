export default function SectionDivider() {
  return (
    <div className="max-w-[1000px] mx-auto px-5" aria-hidden="true">
      <div className="flex items-center gap-3 py-2">
        <span className="h-px flex-1 bg-line" />
        <svg width="14" height="14" viewBox="0 0 24 24" className="text-gold shrink-0">
          <path
            d="M12 2l2.6 7.2L22 12l-7.4 2.8L12 22l-2.6-7.2L2 12l7.4-2.8Z"
            fill="currentColor"
          />
        </svg>
        <span className="h-px flex-1 bg-line" />
      </div>
    </div>
  );
}
