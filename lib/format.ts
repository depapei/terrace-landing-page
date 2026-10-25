const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number) {
  return rupiah.format(value);
}

/** Builds a display label such as "Rp500.000 – Rp1.500.000" from a price range. */
export function formatPriceRange(min: number | null, max: number | null) {
  if (min === null && max === null) return "";
  if (min !== null && max !== null && min !== max) {
    return `${formatRupiah(min)} – ${formatRupiah(max)}`;
  }
  return formatRupiah((min ?? max) as number);
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
