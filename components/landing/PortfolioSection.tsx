import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { PORTFOLIO_TYPE_LABELS } from "@/features/portfolio/schema";
import { getPublishedPortfolio, type PortfolioCardData } from "@/lib/data/portfolio";
import { primaryContactHref } from "@/lib/site-config";
import { Arrow } from "./BrandMark";
import { SectionHead } from "./SectionHeading";

// Mobile: horizontal scroll-snap carousel bleeding to the screen edges.
// Tablet: two columns. Desktop: four columns.
const listClass =
  "m-0 grid list-none grid-cols-4 gap-[18px] p-0 max-tablet:grid-cols-2 max-mobile:-mx-[18px] max-mobile:flex max-mobile:snap-x max-mobile:snap-mandatory max-mobile:scroll-px-[18px] max-mobile:overflow-x-auto max-mobile:px-[18px] max-mobile:pb-2";
const itemClass = "max-mobile:w-[78%] max-mobile:shrink-0 max-mobile:snap-start";

export function PortfolioSection() {
  return (
    <section id="hasil-kerja" aria-labelledby="hasil-kerja-title" className="pb-[100px] max-mobile:pb-[70px]">
      <div className="container-site border-t border-line pt-[100px] max-mobile:pt-[70px]">
        <SectionHead
          id="hasil-kerja-title"
          kicker="Hasil kerja"
          title={
            <>
              Proyek yang telah
              <br />
              kami kerjakan.
            </>
          }
          description="Cuplikan proyek website dan sistem yang kami kerjakan, lengkap dengan durasi pengerjaannya."
        />
        <Suspense fallback={<PortfolioSkeleton />}>
          <PortfolioList />
        </Suspense>
      </div>
    </section>
  );
}

async function PortfolioList() {
  const { items, available } = await getPublishedPortfolio();

  if (!available) {
    return (
      <Notice role="alert">
        Hasil kerja belum dapat dimuat saat ini. Silakan muat ulang halaman beberapa saat lagi.
      </Notice>
    );
  }
  if (!items.length) {
    return (
      <Notice>
        Hasil kerja sedang kami siapkan.{" "}
        <a href={primaryContactHref()} className="font-semibold text-ink underline underline-offset-4">
          Hubungi kami
        </a>{" "}
        untuk melihat contoh proyek yang relevan dengan kebutuhan Anda.
      </Notice>
    );
  }

  return (
    <>
      <p className="mt-0 mb-4 hidden text-xs text-muted max-mobile:block">Geser untuk melihat proyek lainnya.</p>
      <ul aria-label="Daftar hasil kerja" className={listClass}>
        {items.map((item, index) => (
          <li key={item.id} className={itemClass}>
            <PortfolioCard item={item} priority={index === 0} />
          </li>
        ))}
      </ul>
    </>
  );
}

export function PortfolioCard({ item, priority }: { item: PortfolioCardData; priority?: boolean }) {
  return (
    <Link
      href={`/hasil-kerja/${item.slug}`}
      prefetch
      className="group flex h-full flex-col overflow-hidden rounded-[9px] border border-line bg-white/28 transition-colors duration-200 hover:border-ink"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone/35">
        <Image
          src={item.thumbnail.imageUrl}
          alt={item.thumbnail.altText}
          fill
          sizes="(max-width: 650px) 78vw, (max-width: 900px) 45vw, 280px"
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-label">
          {PORTFOLIO_TYPE_LABELS[item.type]} · {item.duration}
        </span>
        <h3 className="mt-2.5 mb-0 text-[17px] leading-[1.35] font-semibold tracking-[-0.4px]">{item.title}</h3>
        <p className="mt-2 mb-0 line-clamp-3 text-[13px] leading-[1.6] text-muted">{item.description}</p>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold">
          Lihat detail <Arrow />
        </span>
      </div>
    </Link>
  );
}

function Notice({ children, role }: { children: ReactNode; role?: "alert" }) {
  return (
    <div role={role} className="rounded-[9px] border border-dashed border-line p-8 text-sm leading-[1.8] text-muted">
      {children}
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <ul role="status" aria-label="Memuat hasil kerja" className={listClass}>
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className={itemClass}>
          <div className="overflow-hidden rounded-[9px] border border-line">
            <div className="aspect-[4/3] animate-pulse bg-stone/35 motion-reduce:animate-none" />
            <div className="grid gap-3 p-5">
              <div className="h-2.5 w-16 rounded bg-stone/40" />
              <div className="h-4 w-3/4 rounded bg-stone/40" />
              <div className="mt-3 h-3 w-20 rounded bg-stone/30" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
