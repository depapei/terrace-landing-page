import type { Metadata } from "next";
import { LeadManager } from "@/features/leads/LeadManager";

export const metadata: Metadata = { title: "Lead Management" };

export default function AdminLeadsPage() {
  return <LeadManager />;
}
