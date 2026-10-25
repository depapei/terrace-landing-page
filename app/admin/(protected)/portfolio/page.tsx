import type { Metadata } from "next";
import { PortfolioManager } from "@/features/portfolio/PortfolioManager";

export const metadata: Metadata = { title: "Hasil kerja" };

export default function AdminPortfolioPage() {
  return <PortfolioManager />;
}
