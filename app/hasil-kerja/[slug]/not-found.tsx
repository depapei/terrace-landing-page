import Link from "next/link";
import { Arrow } from "@/components/landing/BrandMark";
import { buttonClass } from "@/components/landing/button";
import { Navbar } from "@/components/landing/Navbar";
import { headingClass, Kicker } from "@/components/landing/SectionHeading";

export default function PortfolioNotFound() {
  return (
    <>
      <Navbar linkBase="/" />
      <main className="container-site py-[100px] max-mobile:py-[70px]">
        <Kicker>Hasil kerja</Kicker>
        <h1 className={headingClass}>Halaman tidak ditemukan.</h1>
        <p className="mt-4 mb-8 max-w-[460px] text-sm leading-[1.8] text-muted">
          Hasil kerja yang Anda cari tidak tersedia atau sudah tidak dipublikasikan.
        </p>
        <Link href="/#hasil-kerja" className={buttonClass("ink")}>
          Lihat hasil kerja lainnya <Arrow />
        </Link>
      </main>
    </>
  );
}
