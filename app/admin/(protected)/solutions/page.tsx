import type { Metadata } from "next";
import { SolutionManager } from "@/features/solutions/SolutionManager";

export const metadata: Metadata = { title: "Solusi & paket" };

export default function AdminSolutionsPage() {
  return <SolutionManager />;
}
