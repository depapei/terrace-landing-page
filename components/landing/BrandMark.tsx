import { cn } from "@/lib/cn";

// Inline versions of public/assets/terrace-*.svg. The T halves and wordmark use
// currentColor (ink on light surfaces, stone on dark) so they can transition
// with the navbar; the platform bar stays sand, as in the brand files.

function SymbolPaths({ barClassName }: { barClassName?: string }) {
  return (
    <>
      <path fill="currentColor" d="M4 8H30V44H22V18H4Z" />
      <path fill="currentColor" d="M60 16H34V44H42V26H60Z" />
      <rect className={cn("fill-sand", barClassName)} x="4" y="50" width="56" height="6" />
    </>
  );
}

/** Full logo: symbol + wordmark (terrace-logo.svg / terrace-logo-reversed.svg). */
export function Logo({ className, barClassName }: { className?: string; barClassName?: string }) {
  return (
    <svg
      viewBox="0 0 244 80"
      aria-hidden="true"
      focusable="false"
      className={cn("h-11 w-auto transition-colors duration-250", className)}
    >
      <g transform="translate(8 8)">
        <SymbolPaths barClassName={barClassName} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="butt" strokeLinejoin="miter">
        <path d="M96 30.5H118M107 28V56" />
        <path d="M123.5 46H138.5A7.5 7.5 0 1 0 136.3 51.3" />
        <path d="M147.5 56V36M147.5 45.5C147.5 40.5 151 38.5 156 38.5" />
        <path d="M160 56V36M160 45.5C160 40.5 163.5 38.5 168.5 38.5" />
        <circle cx="181" cy="46" r="7.5" />
        <path d="M188.5 36V56" />
        <path d="M209.3 40.7A7.5 7.5 0 1 0 209.3 51.3" />
        <path d="M217.5 46H232.5A7.5 7.5 0 1 0 230.3 51.3" />
      </g>
    </svg>
  );
}

export function Arrow() {
  return (
    <span aria-hidden="true" className="text-[17px] leading-none">
      ↗
    </span>
  );
}
