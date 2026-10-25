"use client";

import { Image } from "antd";

type PreviewImage = { imageUrl: string; altText: string };

/** antd's full-screen image preview on its own (no thumbnails), controlled by the gallery. */
export default function PortfolioPreview({
  images,
  open,
  current,
  onOpenChange,
  onChange,
}: {
  images: PreviewImage[];
  open: boolean;
  current: number;
  onOpenChange: (open: boolean) => void;
  onChange: (current: number) => void;
}) {
  return (
    <Image.PreviewGroup
      items={images.map((image) => ({ src: image.imageUrl, alt: image.altText }))}
      preview={{ open, current, onOpenChange, onChange }}
    />
  );
}
