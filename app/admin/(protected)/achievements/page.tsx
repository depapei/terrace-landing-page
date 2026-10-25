import type { Metadata } from "next";
import { AchievementManager } from "@/features/achievements/AchievementManager";

export const metadata: Metadata = { title: "Achievement" };

export default function AdminAchievementsPage() {
  return <AchievementManager />;
}
