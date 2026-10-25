"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export type FaqItem = { question: string; answer: string };

/** Accessible accordion; at most one answer is open at a time. */
export function FAQAccordion({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const baseId = useId();

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i;
        const qId = `${baseId}-q${i}`;
        const aId = `${baseId}-a${i}`;
        return (
          <div key={item.question} className="border-b border-line">
            <h3 className="m-0">
              <button
                type="button"
                id={qId}
                aria-expanded={isOpen}
                aria-controls={aId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent py-[23px] text-left text-sm font-semibold text-ink"
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-[27px] shrink-0 place-items-center rounded-full border transition-[rotate,background-color,border-color] duration-200",
                    isOpen ? "rotate-45 border-sand bg-sand" : "border-line",
                  )}
                >
                  {/* Drawn as geometry, not a "+" glyph, so it stays optically centered when rotated. */}
                  <svg viewBox="0 0 12 12" className="size-3" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={aId}
              role="region"
              aria-labelledby={qId}
              className={cn(
                "grid transition-[grid-template-rows] duration-250 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              {/* Collapsed answers stay in the DOM but out of the tab order and a11y tree. */}
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="m-0 pr-[42px] pb-[22px] text-[13px] leading-[1.85] text-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
