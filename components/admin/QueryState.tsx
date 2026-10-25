"use client";

import type { ReactNode } from "react";
import { adminButton } from "./ui";

export function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Memuat data" className="grid gap-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-[76px] animate-pulse rounded-lg border border-line bg-white/60" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="grid justify-items-start gap-3 rounded-lg border border-red-700/30 bg-red-50 p-5">
      <p className="m-0 text-sm text-red-800">{message}</p>
      <button type="button" onClick={onRetry} className={adminButton("secondary")}>
        Coba lagi
      </button>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 rounded-lg border border-dashed border-line px-6 py-12 text-center">
      <p className="m-0 font-semibold">{title}</p>
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  );
}
