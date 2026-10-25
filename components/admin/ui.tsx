import { cn } from "@/lib/cn";

// Form controls and modals live in form-fields.tsx / Modal.tsx (Ant Design).
// These are the lightweight list/page actions outside forms.

const buttonVariants = {
  primary: "border-ink bg-ink text-paper hover:bg-ink-soft",
  secondary: "border-line bg-white text-ink hover:border-ink",
  danger: "border-red-700 bg-red-700 text-white hover:bg-red-800",
  ghost: "border-transparent bg-transparent text-ink hover:bg-white",
} as const;

export function adminButton(variant: keyof typeof buttonVariants, className?: string) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariants[variant],
    className,
  );
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold",
        active ? "bg-sand text-ink" : "bg-stone/40 text-muted",
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-full", active ? "bg-ink" : "bg-muted")} />
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}
