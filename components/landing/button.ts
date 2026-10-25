import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md border px-4 py-3 text-[13px] font-semibold transition duration-200 ease-out";

const variants = {
  ink: "border-ink bg-ink text-paper hover:bg-ink-soft",
  sand: "border-sand bg-sand text-ink hover:bg-sand-light",
  outline: "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  light: "border-white/48 bg-white/5 text-white hover:bg-white/15",
} as const;

export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant, className?: string) {
  return cn(base, variants[variant], className);
}

/** True for links that should open in a new tab (absolute http/https URLs). */
export function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}
