import { Suspense, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoadingRows } from "@/components/admin/QueryState";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

// Every page in this group is server-verified against the DB session.
// The session read happens behind Suspense, as Cache Components requires.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  return <AdminShell username={admin.username}>{children}</AdminShell>;
}

function ShellFallback() {
  return (
    <div className="min-h-dvh">
      <div className="h-[100px] bg-ink" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <LoadingRows />
      </div>
    </div>
  );
}
