import { cn } from "@/lib/cn";
import type { LandingSolution } from "@/lib/data/landing";
import { primaryContactHref } from "@/lib/site-config";
import { Arrow } from "./BrandMark";
import { buttonClass, isExternalHref } from "./button";
import { SectionHead } from "./SectionHeading";

export function SolutionsSection({ solutions }: { solutions: LandingSolution[] }) {
  return (
    <section id="paket" aria-labelledby="paket-title" className="py-[100px] max-mobile:py-[70px]">
      <div className="container-site">
        <SectionHead
          id="paket-title"
          kicker="Solusi Terrace"
          title={
            <>
              Pilih paket yang
              <br />
              sesuai kebutuhan.
            </>
          }
          description="Mulai dari website untuk memperkuat kehadiran digital hingga sistem manajemen yang dirancang mengikuti proses bisnis Anda."
        />
        {solutions.length ? (
          <div className="grid grid-cols-2 gap-[18px] max-mobile:grid-cols-1">
            {solutions.map((solution, i) => (
              <PackageCard key={solution.id} solution={solution} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-[9px] border border-dashed border-line p-8 text-sm leading-[1.8] text-muted">
            Informasi paket sedang diperbarui.{" "}
            <a href={primaryContactHref()} className="font-semibold text-ink underline underline-offset-4">
              Hubungi kami
            </a>{" "}
            untuk mendiskusikan kebutuhan Anda.
          </div>
        )}
      </div>
    </section>
  );
}

export function PackageCard({ solution, index }: { solution: LandingSolution; index: number }) {
  const featured = solution.isFeatured;
  const external = isExternalHref(solution.ctaUrl);
  const label = solution.label ?? `Paket ${String(index + 1).padStart(2, "0")}`;

  return (
    <article
      className={cn(
        "flex min-h-[405px] flex-col rounded-[9px] border p-8 max-mobile:min-h-[380px] max-mobile:p-[25px]",
        featured ? "surface-dark border-ink bg-ink text-paper" : "border-line bg-white/28",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-[1.5px]",
            featured ? "text-sand" : "text-[#837d73]",
          )}
        >
          {label}
        </span>
        {solution.badge && (
          <span className="rounded bg-sand px-[9px] py-[7px] text-[10px] font-bold text-ink">
            {solution.badge}
          </span>
        )}
      </div>
      <h3 className="mt-[26px] mb-3 text-[25px] font-bold tracking-[-0.9px]">{solution.name}</h3>
      <p className={cn("m-0 max-w-[430px] text-[13px] leading-[1.8]", featured ? "text-on-dark" : "text-muted")}>
        {solution.description}
      </p>
      <p className="mt-[25px] mb-[23px] text-[31px] font-semibold tracking-[-1.3px]">
        {solution.pricingLabel}{" "}
        {solution.pricingNote && (
          <small
            className={cn(
              "text-xs font-medium tracking-normal",
              featured ? "text-on-dark" : "text-muted",
            )}
          >
            {solution.pricingNote}
          </small>
        )}
      </p>
      {solution.features.length > 0 && (
        <ul
          className={cn(
            "m-0 mb-[25px] grid list-none gap-3 border-t px-0 pt-5 pb-[25px]",
            featured ? "border-line-dark" : "border-line",
          )}
        >
          {solution.features.map((feature) => (
            <li
              key={feature}
              className={cn(
                "flex gap-2.5 text-xs leading-normal",
                featured ? "text-on-dark-strong" : "text-[#666159]",
              )}
            >
              <span aria-hidden="true" className={cn("font-extrabold", featured ? "text-sand" : "text-sand-deep")}>
                ✓
              </span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      <a
        href={solution.ctaUrl}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
        className={buttonClass(featured ? "sand" : "ink", "mt-auto self-start")}
      >
        {solution.ctaLabel} <Arrow />
      </a>
    </article>
  );
}
