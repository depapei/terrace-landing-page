import { generalInquiryMessage, primaryContactHref, siteConfig, whatsappChatHref } from "@/lib/site-config";
import { Arrow } from "./BrandMark";
import { buttonClass, isExternalHref } from "./button";

export function ContactCTA() {
  const { emailHref } = siteConfig.contact;
  // Prefer email; fall back to WhatsApp; otherwise show no dead-end button.
  const href = emailHref ? primaryContactHref("Konsultasi kebutuhan bisnis") : whatsappChatHref(generalInquiryMessage);

  return (
    <section id="kontak" aria-labelledby="kontak-title" className="pt-[25px] pb-[90px] max-mobile:pt-0 max-mobile:pb-[65px]">
      <div className="container-site">
        <div className="flex items-center justify-between gap-[30px] rounded-[10px] bg-sand p-[52px] max-mobile:flex-col max-mobile:items-start max-mobile:p-7">
          <div>
            <h2
              id="kontak-title"
              className="mt-0 mb-3 max-w-[560px] text-[clamp(30px,4vw,43px)] font-semibold leading-[1.12] tracking-[-2px]"
            >
              Punya proses yang ingin dibuat lebih baik?
            </h2>
            <p className="m-0 text-sm leading-[1.7] text-[#5f5649]">
              Mari diskusikan kebutuhan website atau sistem operasional bisnis Anda.
            </p>
          </div>
          {href ? (
            <a
              href={href}
              {...(isExternalHref(href) && { target: "_blank", rel: "noopener noreferrer" })}
              className={buttonClass("ink")}
            >
              Hubungi Terrace <Arrow />
            </a>
          ) : (
            <p className="m-0 text-sm font-semibold text-ink">Kanal kontak resmi segera tersedia.</p>
          )}
        </div>
      </div>
    </section>
  );
}
