"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { adminButton, StatusBadge } from "./ui";

type Item = { id: string; isActive: boolean };

export type RowView = {
  title: string;
  meta?: ReactNode;
  image?: { src: string; alt: string; width: number; height: number };
};

/**
 * Ordered list of CMS rows with keyboard-accessible move, toggle, edit and
 * delete controls. Order on screen equals order on the landing page.
 */
export function ResourceList<T extends Item>({
  items,
  view,
  onEdit,
  onDelete,
  onToggle,
  onReorder,
  reordering,
}: {
  items: T[];
  view: (item: T) => RowView;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onToggle: (item: T) => void;
  onReorder: (ids: string[]) => void;
  reordering?: boolean;
}) {
  const move = (index: number, delta: -1 | 1) => {
    const ids = items.map((item) => item.id);
    const target = index + delta;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(ids);
  };

  return (
    <ol className="m-0 grid list-none gap-2 p-0">
      {items.map((item, index) => {
        const row = view(item);
        return (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white/60 p-3"
          >
            <span className="w-6 text-center text-xs font-semibold tabular-nums text-muted">
              {index + 1}
            </span>
            {row.image && (
              <div className="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded border border-line bg-white">
                <Image
                  src={row.image.src}
                  alt={row.image.alt}
                  width={row.image.width}
                  height={row.image.height}
                  sizes="80px"
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="m-0 truncate font-semibold">{row.title}</p>
                <StatusBadge active={item.isActive} />
              </div>
              {row.meta && <div className="mt-1 text-xs text-muted">{row.meta}</div>}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className={adminButton("ghost", "px-2.5")}
                disabled={index === 0 || reordering}
                onClick={() => move(index, -1)}
                aria-label={`Pindahkan ${row.title} ke atas`}
              >
                <span aria-hidden="true">↑</span>
              </button>
              <button
                type="button"
                className={adminButton("ghost", "px-2.5")}
                disabled={index === items.length - 1 || reordering}
                onClick={() => move(index, 1)}
                aria-label={`Pindahkan ${row.title} ke bawah`}
              >
                <span aria-hidden="true">↓</span>
              </button>
              <button type="button" className={adminButton("secondary")} onClick={() => onToggle(item)}>
                {item.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button type="button" className={adminButton("secondary")} onClick={() => onEdit(item)}>
                Edit
              </button>
              <button
                type="button"
                className={adminButton("ghost", "text-red-700")}
                onClick={() => onDelete(item)}
              >
                Hapus
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
