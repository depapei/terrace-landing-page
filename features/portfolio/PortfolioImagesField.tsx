"use client";

import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Form, Image, Upload } from "antd";
import { useState } from "react";
import { useFieldArray, useFormState, useWatch, type Control } from "react-hook-form";
import { TextInput } from "@/components/admin/form-fields";
import { ACCEPTED_IMAGE_ACCEPT, validateImageFile } from "@/lib/image/constants";
import {
  MAX_PORTFOLIO_IMAGES,
  type PortfolioFormInput,
  type PortfolioFormValues,
  type PortfolioImageDto,
} from "./schema";

/** A newly picked file and its local object-URL preview, keyed by slot key. */
export type PendingUpload = { file: File; url: string };

/**
 * Ordered list of 1–3 project images. Each slot is an existing image (kept
 * as-is) or a new file validated client-side and sent with the form.
 * Upload never sends anything itself (beforeUpload returns false).
 */
export function PortfolioImagesField({
  control,
  existing,
  uploads,
  onUploadsChange,
}: {
  control: Control<PortfolioFormInput, unknown, PortfolioFormValues>;
  existing: PortfolioImageDto[];
  uploads: Map<string, PendingUpload>;
  onUploadsChange: (next: Map<string, PendingUpload>) => void;
}) {
  const { fields, append, remove, move, update } = useFieldArray({ control, name: "images", keyName: "fieldId" });
  const values = useWatch({ control, name: "images" });
  const { errors } = useFormState({ control, name: "images" });
  const [localError, setLocalError] = useState<string | null>(null);
  const byId = new Map(existing.map((image) => [image.id, image]));

  // Returns a new slot key for a valid file, or null after showing the problem.
  function accept(file: File) {
    const problem = validateImageFile(file);
    setLocalError(problem);
    if (problem) return null;
    const key = crypto.randomUUID();
    onUploadsChange(new Map(uploads).set(key, { file, url: URL.createObjectURL(file) }));
    return key;
  }

  function release(key: string) {
    const pending = uploads.get(key);
    if (!pending) return uploads;
    URL.revokeObjectURL(pending.url);
    const next = new Map(uploads);
    next.delete(key);
    return next;
  }

  function replace(index: number, file: File) {
    const problem = validateImageFile(file);
    setLocalError(problem);
    if (problem) return;
    const current = values[index];
    const next = release(current.key);
    const key = crypto.randomUUID();
    next.set(key, { file, url: URL.createObjectURL(file) });
    onUploadsChange(next);
    update(index, { key, existingId: null, altText: current.altText });
  }

  function removeSlot(index: number) {
    onUploadsChange(release(values[index].key));
    remove(index);
  }

  const arrayError = errors.images?.message ?? errors.images?.root?.message;
  const message = localError ?? arrayError;

  return (
    <Form.Item
      label="Gambar proyek"
      required
      validateStatus={message ? "error" : undefined}
      help={message}
      extra={`1–${MAX_PORTFOLIO_IMAGES} gambar. JPEG, PNG, atau WebP, maks. 3 MB per gambar, disimpan sebagai WebP. Gambar pertama dipakai sebagai thumbnail kartu.`}
    >
      <ol className="m-0 grid list-none gap-3 p-0">
        {fields.map((field, index) => {
          const slot = values[index] ?? field;
          const src = uploads.get(slot.key)?.url ?? (slot.existingId ? byId.get(slot.existingId)?.imageUrl : null);
          return (
            <li key={field.fieldId} className="rounded-md border border-line bg-white/60 p-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded border border-dashed border-line bg-white">
                  {src ? (
                    <Image
                      src={src}
                      alt={`Pratinjau gambar ${index + 1}`}
                      width={144}
                      height={96}
                      className="object-cover"
                      preview={{ mask: "Perbesar" }}
                    />
                  ) : (
                    <span className="text-xs text-muted">Belum ada gambar</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 mb-2 text-xs font-semibold text-muted">
                    Gambar {index + 1}
                    {index === 0 && " · Thumbnail"}
                    {uploads.has(slot.key) && " · Baru"}
                  </p>
                  <TextInput
                    control={control}
                    name={`images.${index}.altText`}
                    label="Alt text"
                    required
                    placeholder="Deskripsi singkat isi gambar"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Upload
                  accept={ACCEPTED_IMAGE_ACCEPT}
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(file) => {
                    replace(index, file);
                    return false;
                  }}
                >
                  <Button size="small" icon={<UploadOutlined />}>
                    Ganti
                  </Button>
                </Upload>
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Pindahkan gambar ${index + 1} ke atas`}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Pindahkan gambar ${index + 1} ke bawah`}
                />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeSlot(index)}>
                  Hapus
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      {fields.length < MAX_PORTFOLIO_IMAGES && (
        <Upload
          accept={ACCEPTED_IMAGE_ACCEPT}
          maxCount={1}
          showUploadList={false}
          beforeUpload={(file) => {
            const key = accept(file);
            if (key) append({ key, existingId: null, altText: "" });
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} className={fields.length ? "mt-3" : undefined}>
            Tambah gambar
          </Button>
        </Upload>
      )}
    </Form.Item>
  );
}
