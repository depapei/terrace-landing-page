"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AntForm,
  CheckboxInput,
  FormError,
  NumberInput,
  SubmitBar,
  TextInput,
} from "@/components/admin/form-fields";
import { applyServerErrors, toFormData } from "@/components/admin/form-utils";
import { ImageField } from "@/components/admin/ImageField";
import { ResourceManager } from "@/components/admin/ResourceManager";
import {
  useCreatePartner,
  useDeletePartner,
  usePartners,
  useReorderPartners,
  useSetPartnerActive,
  useUpdatePartner,
} from "./hooks";
import { partnerSchema, type PartnerDto } from "./schema";

export function PartnerManager() {
  const query = usePartners();
  return (
    <ResourceManager
      title="Mitra"
      description="Logo mitra tampil di marquee bawah hero dan di footer. Hanya tambahkan mitra yang kerja samanya sudah dikonfirmasi."
      noun="mitra"
      query={query}
      setActive={useSetPartnerActive()}
      remove={useDeletePartner()}
      reorder={useReorderPartners()}
      emptyHint="Landing page menampilkan pesan netral selama belum ada mitra aktif."
      view={(partner) => ({
        title: partner.name,
        meta: partner.websiteUrl ?? "Tanpa tautan website",
        image: {
          src: partner.logoUrl,
          alt: partner.altText,
          width: partner.logoWidth,
          height: partner.logoHeight,
        },
      })}
      renderForm={({ item, onDone }) => (
        <PartnerForm partner={item} nextSortOrder={query.data?.length ?? 0} onDone={onDone} />
      )}
    />
  );
}

const FIELDS = ["name", "websiteUrl", "altText", "sortOrder", "isActive"] as const;

function PartnerForm({
  partner,
  nextSortOrder,
  onDone,
}: {
  partner: PartnerDto | null;
  nextSortOrder: number;
  onDone: (message: string) => void;
}) {
  const create = useCreatePartner();
  const update = useUpdatePartner();
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: partner?.name ?? "",
      websiteUrl: partner?.websiteUrl ?? "",
      altText: partner?.altText ?? "",
      sortOrder: partner?.sortOrder ?? nextSortOrder,
      isActive: partner?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!partner && !image) {
      setImageError("Logo wajib diunggah.");
      return;
    }
    const payload = toFormData(values, image);
    try {
      if (partner) await update.mutateAsync({ id: partner.id, payload });
      else await create.mutateAsync(payload);
      onDone(partner ? "Mitra diperbarui." : "Mitra ditambahkan.");
    } catch (error) {
      const mapped = applyServerErrors(error, setError, FIELDS);
      setFormError(mapped.formError);
      setImageError(mapped.imageError);
    }
  });

  return (
    <AntForm onSubmit={onSubmit}>
      <FormError message={formError} />
      <ImageField
        label="Logo"
        required={!partner}
        file={image}
        currentUrl={partner?.logoUrl}
        error={imageError}
        onChange={(file) => {
          setImage(file);
          setImageError(undefined);
        }}
      />
      <TextInput control={control} name="name" label="Nama mitra" required />
      <TextInput
        control={control}
        name="websiteUrl"
        label="Website"
        type="url"
        placeholder="https://"
        hint="Opsional. Dibuka di tab baru."
      />
      <TextInput
        control={control}
        name="altText"
        label="Alt text logo"
        required
        hint="Contoh: “Logo PT Contoh Mitra”."
      />
      <NumberInput control={control} name="sortOrder" label="Urutan" />
      <CheckboxInput control={control} name="isActive" label="Aktif" hint="Tampilkan mitra ini di landing page." />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  );
}
