import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <RequestTimeProviders>{children}</RequestTimeProviders>
    </Suspense>
  );
}

// Ant Design generates random ids/style hashes during render, which Cache
// Components cannot prerender. The admin area is authenticated and per-request
// anyway, so render it at request time only.
async function RequestTimeProviders({ children }: { children: ReactNode }) {
  await connection();
  return <Providers>{children}</Providers>;
}
