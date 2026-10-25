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
  TextAreaInput,
  TextInput,
} from "@/components/admin/form-fields";
import { applyServerErrors, toFormData } from "@/components/admin/form-utils";
import { ImageField } from "@/components/admin/ImageField";
import { ResourceManager } from "@/components/admin/ResourceManager";
import {
  useAchievements,
  useCreateAchievement,
  useDeleteAchievement,
  useReorderAchievements,
  useSetAchievementActive,
  useUpdateAchievement,
} from "./hooks";
import { achievementSchema, type AchievementDto } from "./schema";

export function AchievementManager() {
  const query = useAchievements();
  return (
    <ResourceManager
      title="Achievement & badge"
      description="Badge tampil di footer. CMS hanya menyimpan data yang Anda masukkan; pastikan setiap kredensial sudah terverifikasi sebelum diaktifkan."
      noun="badge"
      query={query}
      setActive={useSetAchievementActive()}
      remove={useDeleteAchievement()}
      reorder={useReorderAchievements()}
      emptyHint="Footer tidak menampilkan area achievement selama belum ada badge aktif."
      view={(badge) => ({
        title: badge.name,
        meta: [badge.issuer, badge.credentialUrl].filter(Boolean).join(" · ") || badge.altText,
        image: { src: badge.imageUrl, alt: badge.altText, width: badge.imageWidth, height: badge.imageHeight },
      })}
      renderForm={({ item, onDone }) => (
        <AchievementForm badge={item} nextSortOrder={query.data?.length ?? 0} onDone={onDone} />
      )}
    />
  );
}

const FIELDS = ["name", "description", "issuer", "credentialUrl", "altText", "sortOrder", "isActive"] as const;

function AchievementForm({
  badge,
  nextSortOrder,
  onDone,
}: {
  badge: AchievementDto | null;
  nextSortOrder: number;
  onDone: (message: string) => void;
}) {
  const create = useCreateAchievement();
  const update = useUpdateAchievement();
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      name: badge?.name ?? "",
      description: badge?.description ?? "",
      issuer: badge?.issuer ?? "",
      credentialUrl: badge?.credentialUrl ?? "",
      altText: badge?.altText ?? "",
      sortOrder: badge?.sortOrder ?? nextSortOrder,
      isActive: badge?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!badge && !image) {
      setImageError("Gambar badge wajib diunggah.");
      return;
    }
    const payload = toFormData(values, image);
    try {
      if (badge) await update.mutateAsync({ id: badge.id, payload });
      else await create.mutateAsync(payload);
      onDone(badge ? "Badge diperbarui." : "Badge ditambahkan.");
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
        label="Gambar badge"
        required={!badge}
        file={image}
        currentUrl={badge?.imageUrl}
        error={imageError}
        onChange={(file) => {
          setImage(file);
          setImageError(undefined);
        }}
      />
      <TextInput control={control} name="name" label="Nama badge" required />
      <TextAreaInput control={control} name="description" label="Deskripsi" />
      <TextInput control={control} name="issuer" label="Penerbit" />
      <TextInput
        control={control}
        name="credentialUrl"
        label="URL kredensial"
        type="url"
        placeholder="https://"
        hint="Opsional. Tautan verifikasi dari penerbit, dibuka di tab baru."
      />
      <TextInput control={control} name="altText" label="Alt text" required />
      <NumberInput control={control} name="sortOrder" label="Urutan" />
      <CheckboxInput control={control} name="isActive" label="Aktif" hint="Tampilkan badge ini di footer." />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  );
}
