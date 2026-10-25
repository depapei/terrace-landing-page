"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { PortfolioDetailData } from "@/lib/data/portfolio";

type GalleryImage = PortfolioDetailData["images"][number];

// antd's preview reads Date.now() while rendering, which can't be prerendered; it is
// also only needed after a click, so it loads client-side on first open.
const PortfolioPreview = dynamic(() => import("./PortfolioPreview"), { ssr: false });

/** Large preview of the selected project image with thumbnail buttons to switch; click it to open full size. */
export function PortfolioGallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  // Stays mounted after the first open so the close animation can play.
  const [previewMounted, setPreviewMounted] = useState(false);
  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <button
        type="button"
        aria-label={`Perbesar gambar: ${current.altText}`}
        onClick={() => {
          setPreviewMounted(true);
          setPreviewOpen(true);
        }}
        className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[9px] border border-line bg-white/40 p-0"
      >
        <Image
          key={current.id}
          src={current.imageUrl}
          alt={current.altText}
          fill
          sizes="(max-width: 650px) 100vw, (max-width: 900px) 55vw, 660px"
          loading="eager"
          className="object-contain"
        />
      </button>
      {images.length > 1 && (
        <ul aria-label="Pilih gambar proyek" className="m-0 mt-3 grid list-none grid-cols-3 gap-3 p-0">
          {images.map((image, index) => (
            <li key={image.id}>
              <button
                type="button"
                aria-pressed={index === active}
                aria-label={`Tampilkan gambar ${index + 1}: ${image.altText}`}
                onClick={() => setActive(index)}
                className={cn(
                  "relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-md border-2 bg-white/40 p-0 transition",
                  index === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={image.imageUrl} alt="" fill sizes="(max-width: 650px) 30vw, 200px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* Paging inside the preview also moves the main image. */}
      {previewMounted && (
        <PortfolioPreview
          images={images}
          open={previewOpen}
          current={active}
          onOpenChange={setPreviewOpen}
          onChange={setActive}
        />
      )}
    </div>
  );
}
