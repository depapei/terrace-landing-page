import Image from "next/image";
import { cacheLife } from "next/cache";
import type { LandingAchievement, LandingPartner } from "@/lib/data/landing";
import { siteConfig } from "@/lib/site-config";
import { Logo } from "./BrandMark";

const pageLinks = [
  { href: "#home", label: "Beranda" },
  { href: "#paket", label: "Pilih paket" },
  { href: "#tentang", label: "Tentang kami" },
  { href: "#prinsip", label: "Prinsip kerja" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontak", label: "Kontak" },
];

const productLinks = [
  { href: "#paket", label: "Website bisnis" },
  { href: "#paket", label: "Landing page" },
  { href: "#paket", label: "Warehouse management" },
  { href: "#paket", label: "Custom management system" },
  { href: "#hasil-kerja", label: "Hasil kerja" },
  { href: "#kontak", label: "Ajukan proyek" },
];

const headingClass = "mt-1.5 mb-[21px] text-[11px] font-semibold uppercase tracking-[1.2px] text-sand";
const linkClass = "text-xs text-[#c3beb5] transition-colors hover:text-white";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer({
  partners,
  achievements,
  linkBase = "",
}: {
  partners: LandingPartner[];
  achievements: LandingAchievement[];
  /** Prefix for section anchors, e.g. "/" on pages other than the landing page. */
  linkBase?: string;
}) {
  const { email, emailHref, whatsapp, whatsappHref } = siteConfig.contact;

  return (
    <footer className="surface-dark bg-ink pt-[65px] pb-6 text-paper max-mobile:pt-12">
      <div className="container-site">
        <div className="grid grid-cols-[1.35fr_0.8fr_0.9fr_1fr] gap-[45px] pb-[55px] max-tablet:grid-cols-2 max-tablet:gap-[38px] max-mobile:gap-x-[22px] max-mobile:gap-y-[34px] max-mobile:pb-10">
          <div className="max-mobile:col-span-2">
            <a href={`${linkBase}#home`} aria-label="Terrace beranda" className="mb-4 -ml-2 inline-flex">
              <Logo className="h-12 text-stone" />
            </a>
            <p className="mt-0 mb-[23px] max-w-[290px] text-xs leading-[1.85] text-on-dark">
              {siteConfig.legalName} membantu bisnis membangun website dan software yang mendukung
              operasional lebih terstruktur.
            </p>

            {partners.length > 0 && (
              <>
                <h3 className={headingClass}>Mitra penting</h3>
                <ul className="m-0 mb-[19px] flex list-none flex-wrap gap-[7px] p-0">
                  {partners.map((partner) => (
                    <li key={partner.id}>
                      {partner.websiteUrl ? (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded border border-white/18 px-[9px] py-[7px] text-[10px] text-[#d4cfc6] hover:border-white/40"
                        >
                          {partner.name}
                        </a>
                      ) : (
                        <span className="block rounded border border-white/18 px-[9px] py-[7px] text-[10px] text-[#d4cfc6]">
                          {partner.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {achievements.length > 0 && (
              <>
                <h3 className={headingClass}>Pencapaian</h3>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {achievements.map((badge) => (
                    <li key={badge.id}>
                      <AchievementBadge badge={badge} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <nav aria-labelledby="footer-menu">
            <h3 id="footer-menu" className={headingClass}>
              Menu halaman
            </h3>
            <ul className="m-0 grid list-none gap-[13px] p-0">
              {pageLinks.map((link) => (
                <li key={link.label}>
                  <a href={linkBase + link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-products">
            <h3 id="footer-products" className={headingClass}>
              Produk &amp; portofolio
            </h3>
            <ul className="m-0 grid list-none gap-[13px] p-0">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a href={linkBase + link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className={headingClass}>Hubungi kami</h3>
            <ul className="m-0 grid list-none gap-[13px] p-0">
              {email && emailHref && (
                <li>
                  <a href={emailHref} className={`${linkClass} break-all`}>
                    {email}
                  </a>
                </li>
              )}
              {whatsapp && whatsappHref && (
                <li>
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    WhatsApp: {whatsapp}
                  </a>
                </li>
              )}
              <li>
                <a href={`${linkBase}#kontak`} className={linkClass}>
                  Konsultasi proyek ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border-t border-white/14 pt-[22px] max-mobile:flex-col max-mobile:items-start">
          <small className="text-[10px] text-[#938e85]">
            © <CopyrightYear /> {siteConfig.legalName}. All rights reserved.
          </small>
          <div className="flex gap-[18px]">
            <a href={`${linkBase}#faq`} className="text-[10px] text-on-dark hover:text-white">
              FAQ
            </a>
            <a href={`${linkBase}#kontak`} className="text-[10px] text-on-dark hover:text-white">
              Hubungi kami
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AchievementBadge({ badge }: { badge: LandingAchievement }) {
  const content = (
    <>
      <Image
        src={badge.imageUrl}
        alt={badge.altText}
        width={badge.imageWidth}
        height={badge.imageHeight}
        sizes="32px"
        className="size-8 object-contain"
      />
      <span className="text-[10px] leading-normal">
        {badge.name}
        {badge.issuer && <span className="block text-on-dark">{badge.issuer}</span>}
      </span>
    </>
  );
  const className =
    "inline-flex items-center gap-2 rounded-[5px] border border-sand/45 px-[11px] py-[9px] text-sand";

  return badge.credentialUrl ? (
    <a
      href={badge.credentialUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={badge.description ?? badge.name}
      className={`${className} hover:border-sand`}
    >
      {content}
    </a>
  ) : (
    <span title={badge.description ?? undefined} className={className}>
      {content}
    </span>
  );
}
