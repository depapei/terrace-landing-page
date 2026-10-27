import { generalInquiryMessage, primaryContactHref, siteConfig, whatsappChatHref } from "@/lib/site-config";
import { Arrow } from "./BrandMark";
import { buttonClass, isExternalHref } from "./button";
import { InquiryForm } from "@/features/leads/InquiryForm";

export function ContactCTA() {
  const { emailHref } = siteConfig.contact;
  const whatsappHref = whatsappChatHref(generalInquiryMessage);
  const href = emailHref ? primaryContactHref("Konsultasi kebutuhan bisnis") : null;

  return (
    <section id="kontak" aria-labelledby="kontak-title" className="pt-[25px] pb-[90px] max-mobile:pt-0 max-mobile:pb-[65px]">
      <div className="container-site">
        <div className="grid grid-cols-2 items-start gap-[40px] rounded-[10px] bg-sand p-[52px] max-mobile:grid-cols-1 max-mobile:p-7">
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
            <p className="mt-4 text-sm leading-relaxed text-muted">Isi form atau langsung hubungi kami. Anda tidak perlu mengisi form untuk memulai percakapan.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass("ink")}>Langsung WhatsApp <Arrow /></a>}
              {href && <a href={href} {...(isExternalHref(href) && { target: "_blank", rel: "noopener noreferrer" })} className={buttonClass("outline")}>Email Terrace <Arrow /></a>}
              {!whatsappHref && !href && <p className="m-0 text-sm text-muted">Kirim kebutuhan melalui form; tim kami akan menghubungi Anda.</p>}
            </div>
          </div>
          <InquiryForm />
        </div>
      </div>
    </section>
  );
}
