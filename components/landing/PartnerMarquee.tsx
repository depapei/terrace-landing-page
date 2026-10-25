import Image from "next/image";
import type { LandingPartner } from "@/lib/data/landing";

const MIN_ITEMS_PER_LOOP = 8;

// Repeated copies exist only for the visual loop; keep them out of the a11y tree.
function PartnerLogo({ partner, decorative }: { partner: LandingPartner; decorative?: boolean }) {
  const logo = (
    <Image
      src={partner.logoUrl}
      alt={partner.altText}
      width={partner.logoWidth}
      height={partner.logoHeight}
      sizes="160px"
      className="h-8 w-auto max-w-[150px] object-contain opacity-70 grayscale transition duration-200 hover:opacity-100 hover:grayscale-0"
    />
  );
  return (
    <li
      aria-hidden={decorative || undefined}
      inert={decorative || undefined}
      className="flex min-w-[190px] items-center justify-center px-[25px] py-[7px] max-mobile:min-w-[150px] motion-reduce:[&[inert]]:hidden"
    >
      {partner.websiteUrl ? (
        <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" title={partner.name}>
          {logo}
        </a>
      ) : (
        logo
      )}
    </li>
  );
}

export function PartnerMarquee({ partners }: { partners: LandingPartner[] }) {
  // Repeat short lists so one loop is wider than the viewport, then duplicate
  // it once for a seamless -50% translate.
  const repeat = partners.length ? Math.ceil(MIN_ITEMS_PER_LOOP / partners.length) : 0;
  const loop = Array.from({ length: repeat }, () => partners).flat();

  return (
    <section aria-labelledby="partners-label" className="overflow-hidden border-b border-line pt-[29px] pb-[34px]">
      <div className="container-site mb-[23px] flex justify-between gap-6 max-mobile:flex-col max-mobile:gap-2">
        <h2 id="partners-label" className="text-[10px] font-bold uppercase tracking-[1.7px] text-[#777168]">
          Our partners &amp; collaborations
        </h2>
        <p className="text-[11px] text-[#8a847a]">Bertumbuh melalui kolaborasi</p>
      </div>

      {partners.length === 0 ? (
        <p className="container-site text-[13px] text-muted">
          Kolaborasi dengan mitra akan segera kami tampilkan di sini.
        </p>
      ) : (
        <div className="marquee-mask group overflow-hidden">
          <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:animate-none">
            <ul className="m-0 flex list-none p-0 motion-reduce:flex-wrap motion-reduce:justify-center">
              {loop.map((partner, i) => (
                <PartnerLogo
                  key={`${partner.id}-${i}`}
                  partner={partner}
                  decorative={i >= partners.length}
                />
              ))}
            </ul>
            <ul aria-hidden="true" inert className="m-0 flex list-none p-0 motion-reduce:hidden">
              {loop.map((partner, i) => (
                <PartnerLogo key={`dup-${partner.id}-${i}`} partner={partner} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
