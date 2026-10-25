"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Image, Upload } from "antd";
import { useEffect, useRef, useState } from "react";
import { ACCEPTED_IMAGE_ACCEPT, validateImageFile } from "@/lib/image/constants";

/**
 * Ant Design file picker with client-side size/type validation and a local
 * preview. Upload never sends anything itself (beforeUpload returns false):
 * the valid file is handed to the form and submitted with it, and invalid
 * files are never uploaded.
 */
export function ImageField({
  label,
  file,
  currentUrl,
  error,
  required,
  onChange,
}: {
  label: string;
  file: File | null;
  currentUrl?: string | null;
  error?: string;
  required?: boolean;
  onChange: (file: File | null) => void;
}) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const previewRef = useRef<string | null>(null);

  // Revoke the last object URL when the field unmounts.
  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    },
    [],
  );

  function updatePreview(next: File | null) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = next ? URL.createObjectURL(next) : null;
    previewRef.current = url;
    setPreview(next && url ? { file: next, url } : null);
  }

  // Only show the preview while it still matches the form's file value.
  const shown = (preview && preview.file === file ? preview.url : null) ?? currentUrl ?? null;
  const message = localError ?? error;

  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={message ? "error" : undefined}
      help={message}
      extra={
        <>
          JPEG, PNG, atau WebP, maks. 3 MB. Disimpan otomatis sebagai WebP.
          {currentUrl && " Biarkan kosong untuk mempertahankan gambar saat ini."}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-24 w-36 place-items-center overflow-hidden rounded-md border border-dashed border-line bg-white">
          {shown ? (
            <Image
              src={shown}
              alt="Pratinjau gambar"
              width={144}
              height={96}
              className="object-contain"
              preview={{ mask: "Perbesar" }}
            />
          ) : (
            <span className="text-xs text-muted">Belum ada gambar</span>
          )}
        </div>
        <Upload
          accept={ACCEPTED_IMAGE_ACCEPT}
          maxCount={1}
          showUploadList={false}
          beforeUpload={(selected) => {
            const problem = validateImageFile(selected);
            setLocalError(problem);
            if (problem) {
              updatePreview(null);
              onChange(null);
            } else {
              updatePreview(selected);
              onChange(selected);
            }
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>{shown ? "Ganti gambar" : "Pilih gambar"}</Button>
        </Upload>
      </div>
    </Form.Item>
  );
}
