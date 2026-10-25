import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-bold uppercase tracking-[1.7px] text-label", className)}>
      {children}
    </p>
  );
}

export const headingClass =
  "mt-3.5 text-[clamp(32px,4vw,48px)] font-semibold leading-[1.12] tracking-[-2px]";

/** Kicker + heading on the left, short description on the right (stacks on mobile). */
export function SectionHead({
  kicker,
  title,
  description,
  id,
}: {
  kicker: string;
  title: ReactNode;
  description: string;
  id?: string;
}) {
  return (
    <div className="mb-[42px] flex items-end justify-between gap-8 max-mobile:flex-col max-mobile:items-start max-mobile:gap-[18px]">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 id={id} className={headingClass}>
          {title}
        </h2>
      </div>
      <p className="m-0 max-w-[390px] text-sm leading-[1.8] text-muted">{description}</p>
    </div>
  );
}
