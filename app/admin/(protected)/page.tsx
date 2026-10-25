import type { Metadata } from "next";
import { Dashboard } from "@/features/auth/Dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return <Dashboard />;
}
