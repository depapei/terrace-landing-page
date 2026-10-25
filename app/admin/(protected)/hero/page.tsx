import type { Metadata } from "next";
import { HeroManager } from "@/features/hero/HeroManager";

export const metadata: Metadata = { title: "Hero carousel" };

export default function AdminHeroPage() {
  return <HeroManager />;
}
