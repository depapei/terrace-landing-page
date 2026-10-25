import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/landing/BrandMark";
import { LoginForm } from "@/features/auth/LoginForm";
import { getSessionAdmin } from "@/lib/auth/session";
import Link from "next/link";

export const metadata: Metadata = { title: "Login" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/#home">
            <Logo className="-ml-2 h-14 text-ink" />
          </Link>
          <h1 className="mt-2 mb-0 text-xl font-semibold tracking-[-0.6px]">Masuk ke CMS</h1>
          <p className="m-0 text-xs text-muted">Kelola konten landing page Terrace.</p>
        </div>
        <Suspense>
          <RedirectIfSignedIn />
        </Suspense>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}

async function RedirectIfSignedIn() {
  if (await getSessionAdmin()) redirect("/admin");
  return null;
}
