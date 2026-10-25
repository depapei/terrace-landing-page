import type { Metadata } from "next";
import { PartnerManager } from "@/features/partners/PartnerManager";

export const metadata: Metadata = { title: "Mitra" };

export default function AdminPartnersPage() {
  return <PartnerManager />;
}
