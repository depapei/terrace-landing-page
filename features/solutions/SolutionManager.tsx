"use client";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Typography } from "antd";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  AntForm,
  CheckboxInput,
  FormError,
  NumberInput,
  RadioInput,
  SubmitBar,
  TextAreaInput,
  TextInput,
} from "@/components/admin/form-fields";
import { applyServerErrors } from "@/components/admin/form-utils";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { formatPriceRange, slugify } from "@/lib/format";
import {
  useCreateSolution,
  useDeleteSolution,
  useReorderSolutions,
  useSetSolutionActive,
  useSolutions,
  useUpdateSolution,
} from "./hooks";
import { solutionFormSchema, type SolutionDto } from "./schema";

export function SolutionManager() {
  const query = useSolutions();
  return (
    <ResourceManager
      title="Solusi & paket"
      description="Paket aktif tampil sebagai kartu di section “Pilih paket”. Tandai satu paket sebagai unggulan untuk kartu gelap."
      noun="paket"
      query={query}
      setActive={useSetSolutionActive()}
      remove={useDeleteSolution()}
      reorder={useReorderSolutions()}
      emptyHint="Landing page menampilkan ajakan menghubungi Terrace selama belum ada paket aktif."
      view={(solution) => ({
        title: solution.name,
        meta: (
          <>
            {solution.pricingLabel} · /{solution.slug}
            {solution.isFeatured && " · Unggulan"}
          </>
        ),
      })}
      renderForm={({ item, onDone }) => (
        <SolutionForm solution={item} nextSortOrder={query.data?.length ?? 0} onDone={onDone} />
      )}
    />
  );
}

const FIELDS = [
  "name",
  "slug",
  "label",
  "badge",
  "description",
  "pricingType",
  "priceMin",
  "priceMax",
  "pricingLabel",
  "pricingNote",
  "features",
  "ctaLabel",
  "ctaUrl",
  "isFeatured",
  "sortOrder",
  "isActive",
] as const;

const PRICING_OPTIONS = [
  { value: "FIXED_RANGE", label: "Rentang harga tetap" },
  { value: "CONSULTATION", label: "Berdasarkan konsultasi" },
];

const toNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

function SolutionForm({
  solution,
  nextSortOrder,
  onDone,
}: {
  solution: SolutionDto | null;
  nextSortOrder: number;
  onDone: (message: string) => void;
}) {
  const create = useCreateSolution();
  const update = useUpdateSolution();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(solutionFormSchema),
    defaultValues: {
      name: solution?.name ?? "",
      slug: solution?.slug ?? "",
      label: solution?.label ?? "",
      badge: solution?.badge ?? "",
      description: solution?.description ?? "",
      pricingType: solution?.pricingType ?? "FIXED_RANGE",
      priceMin: solution?.priceMin ?? null,
      priceMax: solution?.priceMax ?? null,
      pricingLabel: solution?.pricingLabel ?? "",
      pricingNote: solution?.pricingNote ?? "",
      features: (solution?.features ?? []).map((value) => ({ value })),
      ctaLabel: solution?.ctaLabel ?? "",
      ctaUrl: solution?.ctaUrl ?? "#kontak",
      isFeatured: solution?.isFeatured ?? false,
      sortOrder: solution?.sortOrder ?? nextSortOrder,
      isActive: solution?.isActive ?? true,
    },
  });

  const features = useFieldArray({ control, name: "features" });
  const [pricingType, priceMin, priceMax] = useWatch({
    control,
    name: ["pricingType", "priceMin", "priceMax"],
  });
  const fixed = pricingType === "FIXED_RANGE";
  const rangePreview = fixed ? formatPriceRange(toNumber(priceMin), toNumber(priceMax)) : "";

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const payload = {
      ...values,
      features: values.features.map((feature) => feature.value),
      priceMin: fixed ? values.priceMin : null,
      priceMax: fixed ? values.priceMax : null,
    };
    try {
      if (solution) await update.mutateAsync({ id: solution.id, payload });
      else await create.mutateAsync(payload);
      onDone(solution ? "Paket diperbarui." : "Paket ditambahkan.");
    } catch (error) {
      setFormError(applyServerErrors(error, setError, FIELDS).formError);
    }
  });

  return (
    <AntForm onSubmit={onSubmit}>
      <FormError message={formError} />
      <div className="grid gap-x-4 sm:grid-cols-2">
        <TextInput
          control={control}
          name="name"
          label="Nama paket"
          required
          // Auto-fill the slug for new packages until the admin edits it by hand.
          onValueChange={(value) => {
            if (!solution && !getFieldState("slug").isDirty) setValue("slug", slugify(value));
          }}
        />
        <TextInput
          control={control}
          name="slug"
          label="Slug"
          required
          hint="Huruf kecil, angka, dan tanda hubung. Harus unik."
        />
        <TextInput control={control} name="label" label="Label kecil" placeholder="Paket 01 / Website" />
        <TextInput control={control} name="badge" label="Badge" placeholder="By consultation" />
      </div>
      <TextAreaInput control={control} name="description" label="Deskripsi" required />

      <Card size="small" title="Harga" className="mb-6">
        <RadioInput control={control} name="pricingType" label="Jenis harga" options={PRICING_OPTIONS} />
        {fixed && (
          <div className="grid gap-x-4 sm:grid-cols-2">
            <NumberInput control={control} name="priceMin" label="Harga minimum" required rupiah prefix="Rp" />
            <NumberInput control={control} name="priceMax" label="Harga maksimum" required rupiah prefix="Rp" />
          </div>
        )}
        {fixed && rangePreview && (
          <p className="mt-0 mb-4 flex flex-wrap items-center gap-1 text-xs text-muted">
            Format Rupiah: <Typography.Text strong>{rangePreview}</Typography.Text>
            <Button
              type="link"
              size="small"
              onClick={() => setValue("pricingLabel", rangePreview, { shouldValidate: true })}
            >
              Gunakan sebagai label
            </Button>
          </p>
        )}
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextInput
            control={control}
            name="pricingLabel"
            label="Label harga (tampil di kartu)"
            required
            placeholder={fixed ? "Rp500 ribu – Rp1,5 juta" : "Wajib konsultasi, harga dinamis"}
          />
          <TextInput control={control} name="pricingNote" label="Catatan harga" placeholder="sesuai ruang lingkup" />
        </div>
      </Card>

      <Card size="small" title="Fitur" className="mb-6">
        {features.fields.length === 0 && <p className="mt-0 text-xs text-muted">Belum ada fitur.</p>}
        {features.fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <TextInput control={control} name={`features.${index}.value`} label={`Fitur ${index + 1}`} />
            </div>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              className="mt-[30px]"
              onClick={() => features.remove(index)}
              aria-label={`Hapus fitur ${index + 1}`}
            />
          </div>
        ))}
        {errors.features?.message && <p className="mt-0 text-xs text-red-700">{errors.features.message}</p>}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          disabled={features.fields.length >= 12}
          onClick={() => features.append({ value: "" })}
        >
          Tambah fitur
        </Button>
      </Card>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <TextInput control={control} name="ctaLabel" label="Label CTA" required />
        <TextInput
          control={control}
          name="ctaUrl"
          label="Tujuan CTA"
          required
          hint="#kontak, /halaman, https://…, mailto:… atau tel:…"
        />
        <NumberInput control={control} name="sortOrder" label="Urutan" />
      </div>
      <CheckboxInput control={control} name="isFeatured" label="Paket unggulan" hint="Ditampilkan sebagai kartu gelap." />
      <CheckboxInput control={control} name="isActive" label="Aktif" hint="Tampilkan paket ini di landing page." />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  );
}
