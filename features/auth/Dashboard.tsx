"use client";

import Link from "next/link";
import { PageHeader } from "@/components/admin/AdminShell";
import { ErrorState, LoadingRows } from "@/components/admin/QueryState";
import { useAdminStats, type AdminStats } from "./hooks";

const cards: { key: keyof AdminStats; label: string; href: string }[] = [
  { key: "hero", label: "Hero slide aktif", href: "/admin/hero" },
  { key: "solutions", label: "Paket aktif", href: "/admin/solutions" },
  { key: "portfolio", label: "Hasil kerja terbit", href: "/admin/portfolio" },
  { key: "partners", label: "Mitra aktif", href: "/admin/partners" },
  { key: "achievements", label: "Achievement aktif", href: "/admin/achievements" },
];

export function Dashboard() {
  const stats = useAdminStats();

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan konten yang saat ini tampil di landing page." />
      {stats.isPending ? (
        <LoadingRows rows={2} />
      ) : stats.isError ? (
        <ErrorState message={stats.error.message} onRetry={() => stats.refetch()} />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((card) => (
            <li key={card.key}>
              <Link
                href={card.href}
                className="block rounded-lg border border-line bg-white/60 p-5 transition hover:border-ink"
              >
                <span className="block text-[11px] font-bold uppercase tracking-[1.5px] text-label">
                  {card.label}
                </span>
                <span className="mt-2 block text-4xl font-semibold tabular-nums tracking-[-1.5px]">
                  {stats.data[card.key]}
                </span>
                <span className="mt-2 block text-xs text-muted">Kelola →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
