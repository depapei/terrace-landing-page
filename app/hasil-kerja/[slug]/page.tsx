import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/landing/BrandMark";
import { buttonClass } from "@/components/landing/button";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { PortfolioGallery } from "@/components/landing/PortfolioGallery";
import { headingClass, Kicker } from "@/components/landing/SectionHeading";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { PORTFOLIO_TYPE_LABELS } from "@/features/portfolio/schema";
import { getLandingData } from "@/lib/data/landing";
import {
  getPublishedPortfolioBySlug,
  getPublishedPortfolioSlugs,
  type PortfolioDetailData,
} from "@/lib/data/portfolio";
import { primaryContactHref, whatsappChatHref } from "@/lib/site-config";

// Published items are prerendered; others render on first visit and are cached.
// Cache Components needs at least one param: "_" can never be a valid slug, so it 404s.
export async function generateStaticParams() {
  const slugs = await getPublishedPortfolioSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: PageProps<"/hasil-kerja/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedPortfolioBySlug(slug);
  if (result.status !== "ok") return { title: "Hasil kerja" };
  const { item } = result;
  return {
    title: item.title,
    description: item.description.length > 160 ? `${item.description.slice(0, 157).trimEnd()}…` : item.description,
    alternates: { canonical: `/hasil-kerja/${item.slug}` },
  };
}

// params are awaited before rendering so unknown or unpublished slugs return a real 404.
export default async function PortfolioDetailPage({ params }: PageProps<"/hasil-kerja/[slug]">) {
  const { slug } = await params;
  const [result, { partners, achievements }] = await Promise.all([
    getPublishedPortfolioBySlug(slug),
    getLandingData(),
  ]);
  if (result.status === "not-found") notFound();

  return (
    <>
      <Navbar linkBase="/" />
      <main>
        {result.status === "ok" ? <PortfolioDetail item={result.item} /> : <DetailError />}
      </main>
      <Footer partners={partners} achievements={achievements} linkBase="/" />
      <WhatsAppButton />
    </>
  );
}

const backLinkClass = "text-[13px] text-muted transition-colors hover:text-ink";
const metaLabelClass = "text-[10px] font-bold uppercase tracking-[1.5px] text-label";
const metaValueClass = "m-0 mt-1.5 text-[15px] font-semibold";

function PortfolioDetail({ item }: { item: PortfolioDetailData }) {
  // Without a configured email the contact target is the landing page section.
  const projectMessage = `Halo Terrace, kami ingin mendiskusikan proyek serupa dengan ${item.title}. Mohon informasi mengenai pendekatan dan estimasi implementasi yang sesuai dengan kebutuhan kami.`;
  const contact = whatsappChatHref(projectMessage) ?? primaryContactHref(`Diskusi proyek serupa: ${item.title}`);
  const contactHref = contact.startsWith("#") ? `/${contact}` : contact;

  return (
    <article className="container-site py-[70px] max-mobile:py-[45px]">
      <Link href="/#hasil-kerja" className={backLinkClass}>
        ← Kembali ke hasil kerja
      </Link>
      <div className="mt-8 grid grid-cols-[1.2fr_0.8fr] items-start gap-[60px] max-tablet:gap-9 max-mobile:grid-cols-1 max-mobile:gap-8">
        <PortfolioGallery images={item.images} />
        <div>
          <Kicker>Hasil kerja</Kicker>
          <h1 className={headingClass}>{item.title}</h1>
          <dl className="mt-7 mb-6 grid grid-cols-2 gap-6 border-y border-line py-4">
            <div>
              <dt className={metaLabelClass}>Tipe</dt>
              <dd className={metaValueClass}>{PORTFOLIO_TYPE_LABELS[item.type]}</dd>
            </div>
            <div>
              <dt className={metaLabelClass}>Durasi pengerjaan</dt>
              <dd className={metaValueClass}>{item.duration}</dd>
            </div>
          </dl>
          <p className="mt-0 mb-8 whitespace-pre-line text-[15px] leading-[1.9] text-muted">{item.description}</p>
          <div className="flex flex-wrap gap-3">
            {item.liveUrl && (
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
                {item.type === "WEBSITE" ? "Kunjungi website" : "Lihat demo"} ↗
              </a>
            )}
            <a href={contactHref} className={buttonClass("ink")} target='_blank' rel="noopener noreferrer">
              Diskusikan proyek serupa <Arrow />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function DetailError() {
  return (
    <div className="container-site py-[70px] max-mobile:py-[45px]">
      <div role="alert" className="rounded-[9px] border border-dashed border-line p-8 text-sm leading-[1.8] text-muted">
        Hasil kerja ini belum dapat dimuat saat ini. Silakan muat ulang halaman beberapa saat lagi, atau{" "}
        <Link href="/#hasil-kerja" className="font-semibold text-ink underline underline-offset-4">
          kembali ke daftar hasil kerja
        </Link>
        .
      </div>
    </div>
  );
}
