"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/landing/BrandMark";
import { useLogout } from "@/features/auth/hooks";
import { cn } from "@/lib/cn";
import { adminButton } from "./ui";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/solutions", label: "Solusi & paket" },
  { href: "/admin/portfolio", label: "Hasil kerja" },
  { href: "/admin/partners", label: "Mitra" },
  { href: "/admin/achievements", label: "Achievement" },
] as const;

export function AdminShell({ username, children }: { username: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  return (
    <div className="min-h-dvh">
      <header className="surface-dark sticky top-0 z-50 border-b border-white/14 bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" aria-label="Terrace CMS, dashboard" className="inline-flex items-center gap-1">
            <Logo className="h-10 text-stone" />
            <span className="rounded bg-sand px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-ink">
              CMS
            </span>
          </Link>
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="text-on-dark hover:text-white">
              Lihat situs ↗
            </Link>
            <span className="text-on-dark max-mobile:hidden">{username}</span>
            <button
              type="button"
              className={adminButton("secondary")}
              disabled={logout.isPending}
              onClick={() =>
                logout.mutate(undefined, {
                  onSettled: () => {
                    router.replace("/admin/login");
                    router.refresh();
                  },
                })
              }
            >
              {logout.isPending ? "Keluar…" : "Keluar"}
            </button>
          </div>
        </div>
        <nav aria-label="Navigasi admin" className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="m-0 flex list-none gap-1 p-0">
            {nav.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border-b-2 px-3 py-2.5 text-[13px] whitespace-nowrap",
                      active ? "border-sand text-white" : "border-transparent text-on-dark hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="m-0 text-[28px] font-semibold tracking-[-1px]">{title}</h1>
        {description && <p className="mt-1 mb-0 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
