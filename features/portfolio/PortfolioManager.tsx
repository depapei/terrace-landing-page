"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "antd";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { applyServerErrors, toFormData } from "@/components/admin/form-utils";
import { ResourceManager } from "@/components/admin/ResourceManager";
import type { StatusLabels } from "@/components/admin/ui";
import { slugify } from "@/lib/format";
import {
  useCreatePortfolio,
  useDeletePortfolio,
  usePortfolio,
  useReorderPortfolio,
  useSetPortfolioActive,
  useUpdatePortfolio,
} from "./hooks";
import { PortfolioImagesField, type PendingUpload } from "./PortfolioImagesField";
import {
  PORTFOLIO_TYPE_LABELS,
  PORTFOLIO_TYPES,
  portfolioFormSchema,
  UPLOAD_FIELDS,
  type PortfolioDto,
} from "./schema";

const STATUS_LABELS: StatusLabels = {
  on: "Terbit",
  off: "Draf",
  activate: "Terbitkan",
  deactivate: "Jadikan draf",
  activated: "diterbitkan",
  deactivated: "dijadikan draf",
};

const publicPath = (slug: string) => `/hasil-kerja/${slug}`;

const TYPE_OPTIONS = PORTFOLIO_TYPES.map((value) => ({ value, label: PORTFOLIO_TYPE_LABELS[value] }));

export function PortfolioManager() {
  const query = usePortfolio();
  return (
    <ResourceManager
      title="Hasil kerja"
      description="Proyek yang diterbitkan tampil setelah section “Pilih paket” dan memiliki halaman detail sendiri. Tampilkan hanya proyek nyata yang sudah disetujui untuk dipublikasikan."
      noun="hasil kerja"
      query={query}
      setActive={useSetPortfolioActive()}
      remove={useDeletePortfolio()}
      reorder={useReorderPortfolio()}
      statusLabels={STATUS_LABELS}
      emptyHint="Landing page menampilkan pesan bahwa hasil kerja sedang disiapkan selama belum ada proyek yang terbit."
      view={(item) => {
        const thumb = item.images[0];
        return {
          title: item.title,
          meta: (
            <>
              {PORTFOLIO_TYPE_LABELS[item.type]} · {item.duration} · {publicPath(item.slug)} · {item.images.length} gambar
            </>
          ),
          image: thumb && {
            src: thumb.imageUrl,
            alt: thumb.altText,
            width: thumb.imageWidth,
            height: thumb.imageHeight,
          },
        };
      }}
      renderView={(item) => <PortfolioDetail item={item} />}
      renderForm={({ item, onDone }) => (
        <PortfolioForm item={item} nextSortOrder={query.data?.length ?? 0} onDone={onDone} />
      )}
    />
  );
}

function PortfolioDetail({ item }: { item: PortfolioDto }) {
  return (
    <div className="grid gap-4">
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted">Status</dt>
        <dd className="m-0">{item.isActive ? "Terbit" : "Draf"}</dd>
        <dt className="text-muted">Tipe</dt>
        <dd className="m-0">{PORTFOLIO_TYPE_LABELS[item.type]}</dd>
        {item.liveUrl && (
          <>
            <dt className="text-muted">Link live/demo</dt>
            <dd className="m-0 break-all">
              <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="underline">
                {item.liveUrl} ↗
              </a>
            </dd>
          </>
        )}
        <dt className="text-muted">Durasi</dt>
        <dd className="m-0">{item.duration}</dd>
        <dt className="text-muted">Halaman</dt>
        <dd className="m-0">
          {item.isActive ? (
            <a href={publicPath(item.slug)} target="_blank" rel="noopener noreferrer" className="underline">
              {publicPath(item.slug)} ↗
            </a>
          ) : (
            <span>{publicPath(item.slug)} (belum terbit)</span>
          )}
        </dd>
      </dl>
      <p className="m-0 whitespace-pre-line text-sm leading-[1.8]">{item.description}</p>
      <Image.PreviewGroup>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3">
          {item.images.map((image, index) => (
            <li key={image.id}>
              <Image
                src={image.imageUrl}
                alt={image.altText}
                width="100%"
                rootClassName="block"
                className="aspect-[4/3] rounded border border-line object-cover"
                preview={{ mask: "Perbesar" }}
              />
              <p className="mt-1 mb-0 text-xs text-muted">
                {index === 0 ? "Thumbnail · " : ""}
                {image.altText}
              </p>
            </li>
          ))}
        </ul>
      </Image.PreviewGroup>
    </div>
  );
}

const FIELDS = ["title", "slug", "type", "liveUrl", "description", "duration", "sortOrder", "isActive", "images"] as const;

function PortfolioForm({
  item,
  nextSortOrder,
  onDone,
}: {
  item: PortfolioDto | null;
  nextSortOrder: number;
  onDone: (message: string) => void;
}) {
  const create = useCreatePortfolio();
  const update = useUpdatePortfolio();
  const [formError, setFormError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Map<string, PendingUpload>>(new Map());

  // Revoke the remaining object URLs when the form unmounts.
  const uploadsRef = useRef(uploads);
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);
  useEffect(
    () => () => {
      for (const pending of uploadsRef.current.values()) URL.revokeObjectURL(pending.url);
    },
    [],
  );

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    getFieldState,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(portfolioFormSchema),
    defaultValues: {
      title: item?.title ?? "",
      slug: item?.slug ?? "",
      type: item?.type ?? "WEBSITE",
      liveUrl: item?.liveUrl ?? "",
      description: item?.description ?? "",
      duration: item?.duration ?? "",
      sortOrder: item?.sortOrder ?? nextSortOrder,
      isActive: item?.isActive ?? false,
      images: (item?.images ?? []).map((image) => ({
        key: image.id,
        existingId: image.id,
        altText: image.altText,
      })),
    },
  });

  const isWebsite = useWatch({ control, name: "type" }) === "WEBSITE";

  const onSubmit = handleSubmit(async ({ images, ...values }) => {
    setFormError(null);
    const payload = toFormData(values, null);
    let next = 0;
    const manifest = images.map((image) => {
      if (image.existingId) return { id: image.existingId, altText: image.altText };
      const field = UPLOAD_FIELDS[next++];
      const pending = uploads.get(image.key);
      if (pending) payload.append(field, pending.file);
      return { upload: field, altText: image.altText };
    });
    payload.append("images", JSON.stringify(manifest));

    try {
      if (item) await update.mutateAsync({ id: item.id, payload });
      else await create.mutateAsync(payload);
      onDone(item ? "Hasil kerja diperbarui." : "Hasil kerja ditambahkan.");
    } catch (error) {
      const mapped = applyServerErrors(error, setError, FIELDS);
      if (mapped.imageError) setError("images", { type: "server", message: mapped.imageError });
      setFormError(mapped.formError);
    }
  });

  return (
    <AntForm onSubmit={onSubmit}>
      <FormError message={formError} />
      <TextInput
        control={control}
        name="title"
        label="Judul proyek"
        required
        // Auto-fill the slug for new items until the admin edits it by hand.
        onValueChange={(value) => {
          if (!item && !getFieldState("slug").isDirty) setValue("slug", slugify(value));
        }}
      />
      <TextInput
        control={control}
        name="slug"
        label="Slug"
        required
        hint="Dipakai di alamat /hasil-kerja/slug. Huruf kecil, angka, dan tanda hubung. Harus unik."
      />
      <RadioInput control={control} name="type" label="Tipe hasil kerja" options={TYPE_OPTIONS} />
      <TextInput
        control={control}
        name="liveUrl"
        label="Link live/demo"
        required={isWebsite}
        placeholder="https://"
        hint={
          isWebsite
            ? "Wajib untuk website. Alamat situs yang sudah live atau link demo."
            : "Opsional. Link demo, prototipe, atau halaman toko aplikasi."
        }
      />
      <TextInput control={control} name="duration" label="Durasi" required placeholder="mis. 6 minggu" />
      <TextAreaInput
        control={control}
        name="description"
        label="Deskripsi proyek"
        required
        autoSize={{ minRows: 4, maxRows: 12 }}
      />
      <PortfolioImagesField
        control={control}
        existing={item?.images ?? []}
        uploads={uploads}
        onUploadsChange={setUploads}
      />
      <NumberInput control={control} name="sortOrder" label="Urutan" />
      <CheckboxInput
        control={control}
        name="isActive"
        label="Terbitkan"
        hint="Tampilkan di landing page dan buka halaman detailnya untuk publik."
      />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  );
}
