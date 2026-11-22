"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

interface CategoryTabsProps {
  categories: { slug: string; name: string }[];
}

export default function CategoryTabs({ categories }: CategoryTabsProps) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = categories
      .map((c) => document.getElementById(`cat-${c.slug}`))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const slug = visible[0].target.id.replace("cat-", "");
          setActive(slug);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  function handleClick(slug: string) {
    setActive(slug);
    document
      .getElementById(`cat-${slug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      ref={tabsRef}
      className="sticky top-14 sm:top-16 z-20 bg-bg border-b border-line shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      role="tablist"
      aria-label="Menu categories"
    >
      <div className="max-w-[1280px] mx-auto px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            role="tab"
            aria-selected={active === c.slug}
            onClick={() => handleClick(c.slug)}
            className={clsx(
              "shrink-0 rounded-pill border px-4 py-2 text-sm font-body font-semibold min-h-10 transition-all",
              active === c.slug
                ? "bg-red border-red text-white shadow-[0_3px_10px_rgba(200,16,46,0.45)] scale-105"
                : "border-line text-cream hover:bg-red hover:border-red hover:text-white"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
