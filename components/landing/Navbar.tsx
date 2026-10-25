"use client";

import { useScrolledPast } from "@/hooks/use-browser-state";
import { cn } from "@/lib/cn";
import { Arrow, Logo } from "./BrandMark";

const links = [
  { href: "#paket", label: "Pilih paket" },
  { href: "#tentang", label: "Tentang kami" },
  { href: "#prinsip", label: "Prinsip kerja" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const scrolled = useScrolledPast(24);

  return (
    <header
      data-scrolled={scrolled}
      className={cn(
        "group sticky top-0 z-[1000] flex h-[78px] items-center border-b transition-[background-color,color,border-color,box-shadow] duration-250 max-mobile:h-[70px]",
        scrolled
          ? "surface-dark border-white/14 bg-ink text-paper shadow-[0_8px_25px_rgb(0_0_0/0.12)]"
          : "border-line bg-paper text-ink",
      )}
    >
      <div className="container-site flex items-center justify-between gap-7">
        <a href="#home" aria-label="Terrace beranda" className="inline-flex shrink-0 items-center">
          <Logo className="h-11 text-ink group-data-[scrolled=true]:text-stone max-mobile:h-10" />
        </a>
        <nav
          aria-label="Navigasi utama"
          className="flex items-center gap-[30px] text-[13px] max-tablet:gap-4 max-mobile:hidden"
        >
          {links.map((link) => (
            <a key={link.href} href={link.href} className="opacity-75 transition-opacity hover:opacity-100">
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#kontak"
          className={cn(
            "inline-flex items-center gap-2.5 whitespace-nowrap rounded-md border px-4 py-3 text-[13px] font-semibold transition duration-200 max-mobile:px-3 max-mobile:py-2.5 max-mobile:text-[11px]",
            scrolled ? "border-sand bg-sand text-ink" : "border-ink bg-ink text-paper",
          )}
        >
          Diskusikan proyek <Arrow />
        </a>
      </div>
    </header>
  );
}
