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
  useCreateHeroSlide,
  useDeleteHeroSlide,
  useHeroSlides,
  useReorderHeroSlides,
  useSetHeroSlideActive,
  useUpdateHeroSlide,
} from "./hooks";
import { heroSlideSchema, type HeroSlideDto } from "./schema";

export function HeroManager() {
  const query = useHeroSlides();
  return (
    <ResourceManager
      title="Hero carousel"
      description="Slide aktif pertama menampilkan intro dan CTA. Slide berikutnya hanya menampilkan gambar dan caption."
      noun="slide"
      query={query}
      setActive={useSetHeroSlideActive()}
      remove={useDeleteHeroSlide()}
      reorder={useReorderHeroSlides()}
      emptyHint="Selama belum ada slide aktif, landing page memakai artwork bawaan."
      view={(slide) => ({
        title: slide.title || "Slide tanpa judul",
        meta: slide.subtitle ?? slide.altText,
        image: { src: slide.imageUrl, alt: slide.altText, width: slide.imageWidth, height: slide.imageHeight },
      })}
      renderForm={({ item, onDone }) => (
        <HeroForm slide={item} nextSortOrder={query.data?.length ?? 0} onDone={onDone} />
      )}
    />
  );
}

const FIELDS = ["title", "subtitle", "altText", "sortOrder", "isActive"] as const;

function HeroForm({
  slide,
  nextSortOrder,
  onDone,
}: {
  slide: HeroSlideDto | null;
  nextSortOrder: number;
  onDone: (message: string) => void;
}) {
  const create = useCreateHeroSlide();
  const update = useUpdateHeroSlide();
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: {
      title: slide?.title ?? "",
      subtitle: slide?.subtitle ?? "",
      altText: slide?.altText ?? "",
      sortOrder: slide?.sortOrder ?? nextSortOrder,
      isActive: slide?.isActive ?? true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    if (!slide && !image) {
      setImageError("Gambar wajib diunggah.");
      return;
    }
    const payload = toFormData(values, image);
    try {
      if (slide) await update.mutateAsync({ id: slide.id, payload });
      else await create.mutateAsync(payload);
      onDone(slide ? "Slide diperbarui." : "Slide ditambahkan.");
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
        label="Gambar slide"
        required={!slide}
        file={image}
        currentUrl={slide?.imageUrl}
        error={imageError}
        onChange={(file) => {
          setImage(file);
          setImageError(undefined);
        }}
      />
      <TextInput
        control={control}
        name="title"
        label="Judul / caption"
        hint="Ditampilkan sebagai caption di bawah carousel, misalnya “Digital solutions”."
      />
      <TextAreaInput control={control} name="subtitle" label="Subtitle" />
      <TextInput
        control={control}
        name="altText"
        label="Alt text"
        required
        hint="Deskripsi singkat gambar untuk pembaca layar dan SEO."
      />
      <NumberInput control={control} name="sortOrder" label="Urutan" />
      <CheckboxInput control={control} name="isActive" label="Aktif" hint="Tampilkan slide ini di landing page." />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  );
}
