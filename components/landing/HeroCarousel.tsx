"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-browser-state";
import { cn } from "@/lib/cn";
import type { LandingHeroSlide } from "@/lib/data/landing";

const AUTOPLAY_MS = 6500;

type Slide =
  | { kind: "image"; id: string; caption: string; subtitle: string | null; slide: LandingHeroSlide }
  | { kind: "art"; id: string; caption: string; subtitle: null; art: string };

// Shown only when the CMS has no active slides, so the hero never renders empty.
const FALLBACK: Slide[] = [
  { kind: "art", id: "art-1", caption: "Digital solutions", subtitle: null, art: "art-warehouse" },
  { kind: "art", id: "art-2", caption: "Systems built around you", subtitle: null, art: "art-dashboard" },
  { kind: "art", id: "art-3", caption: "Better work, together", subtitle: null, art: "art-team" },
];

const pad = (n: number) => String(n).padStart(2, "0");

export function HeroCarousel({ slides, intro }: { slides: LandingHeroSlide[]; intro: ReactNode }) {
  const items: Slide[] = slides.length
    ? slides.map((slide) => ({
        kind: "image",
        id: slide.id,
        caption: slide.title ?? "Terrace",
        subtitle: slide.subtitle,
        slide,
      }))
    : FALLBACK;

  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const total = items.length;
  const index = current % total;
  const autoplay = total > 1 && !hovered && !focused && !reducedMotion;

  // Re-armed on every slide change, so manual navigation also restarts the timer.
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => setCurrent((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, index, total]);

  const go = (delta: number) => setCurrent((i) => (((i + delta) % total) + total) % total);
  const active = items[index];

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Perkenalan Terrace"
      className="relative h-[min(720px,calc(100svh-78px))] min-h-[560px] w-full overflow-hidden bg-hero text-white max-mobile:h-[690px] max-mobile:min-h-[600px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="absolute inset-0">
        {items.map((item, i) => {
          const isActive = i === index;
          return (
            <div
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${total}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={cn(
                "absolute inset-0 transition-[opacity,visibility] duration-700 ease-out",
                isActive ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              {item.kind === "image" ? (
                <div className="hero-art absolute inset-0 overflow-hidden">
                  <Image
                    src={item.slide.imageUrl}
                    alt={item.slide.altText}
                    fill
                    sizes="100vw"
                    preload={i === 0}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div aria-hidden="true" className={cn("hero-art absolute inset-0 overflow-hidden", item.art)} />
              )}
            </div>
          );
        })}
      </div>

      {/* Intro and CTAs belong to the first slide only. */}
      <div
        aria-hidden={index !== 0}
        inert={index !== 0}
        className={cn(
          "absolute top-1/2 left-[max(24px,calc((100%-1160px)/2))] z-[3] max-w-[600px] pr-7 transition-[opacity,translate] duration-250 max-tablet:max-w-[560px] max-mobile:top-[46%] max-mobile:right-[22px] max-mobile:left-[22px] max-mobile:pr-0",
          index === 0
            ? "-translate-y-1/2 opacity-100"
            : "pointer-events-none -translate-x-5 -translate-y-1/2 opacity-0",
        )}
      >
        {intro}
      </div>

      <div className="hero-inset-x absolute bottom-7 z-[4] flex items-center justify-between gap-5 max-mobile:bottom-5">
        <p aria-live={autoplay ? "off" : "polite"} className="m-0 text-white/68">
          <span className="block text-[11px] uppercase tracking-[1px] max-mobile:max-w-[120px] max-mobile:text-[9px] max-mobile:leading-normal">
            {active.caption} / {pad(index + 1)}
          </span>
          {active.subtitle && (
            <span className="mt-1 block max-w-[420px] text-xs text-white/60 max-mobile:hidden">
              {active.subtitle}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2.5">
          <span className="min-w-[55px] text-xs tabular-nums text-white">
            {pad(index + 1)} / {pad(total)}
          </span>
          <div aria-hidden="true" className="h-0.5 w-[100px] bg-white/28 max-mobile:w-[50px]">
            <span
              className="block h-full bg-sand transition-[width] duration-350"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          {total > 1 && (
            <>
              <CarouselButton label="Slide sebelumnya" onClick={() => go(-1)}>
                ←
              </CarouselButton>
              <CarouselButton label="Slide berikutnya" onClick={() => go(1)}>
                →
              </CarouselButton>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="surface-dark grid size-[42px] cursor-pointer place-items-center rounded-full border border-white/45 bg-transparent text-white transition hover:border-sand hover:bg-sand hover:text-ink max-mobile:size-10"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
