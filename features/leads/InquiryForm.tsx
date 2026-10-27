"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { buttonClass } from "@/components/landing/button";
import { ApiClientError, api } from "@/lib/axios";
import { publicLeadFormSchema, type PublicLeadResult } from "./schema";

type FormValues = z.input<typeof publicLeadFormSchema>;
const inputClass = "mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm text-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink";

export function InquiryForm() {
  const [result, setResult] = useState<PublicLeadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef<{ body: string; key: string } | null>(null);
  const { register, handleSubmit, setError: setFieldError, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(publicLeadFormSchema),
    defaultValues: { companyName: "", contactType: "WHATSAPP" as const, contactValue: "", requirements: "", website: "" },
  });

  const submit = async (values: z.output<typeof publicLeadFormSchema>) => {
    setError(null);
    const body = JSON.stringify(values);
    // A timeout retry with unchanged input reuses the key; keys contain no PII.
    if (attempt.current?.body !== body) attempt.current = { body, key: crypto.randomUUID() };
    try {
      const response = await api.post<PublicLeadResult>("/public/leads", { ...values, submissionKey: attempt.current.key });
      setResult(response.data);
      if (response.data.whatsappUrl) {
        // Some browsers block a new tab after an async save; the visible link remains.
        window.open(response.data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        for (const [name, messages] of Object.entries(caught.fieldErrors ?? {})) {
          if (["companyName", "contactType", "contactValue", "requirements"].includes(name) && messages?.[0]) {
            setFieldError(name as keyof FormValues, { message: messages[0] });
          }
        }
        setError(caught.message);
      } else setError("Pengiriman belum dapat dipastikan. Silakan coba lagi dengan isian yang sama.");
    }
  };

  if (result) return (
    <div role="status" className="rounded-lg border border-line bg-white p-6">
      <h3 className="mt-0 mb-2 text-xl font-semibold">Terima kasih, kebutuhan Anda sudah tersimpan.</h3>
      <p className="text-sm leading-relaxed text-muted">
        {result.whatsappUrl
          ? "Lanjutkan percakapan di WhatsApp. Jika tab baru tidak terbuka, gunakan tombol di bawah. Anda masih perlu menekan Kirim di WhatsApp."
          : "Tim Terrace akan meninjau kebutuhan Anda dan menghubungi kontak yang diberikan."}
      </p>
      <div className="flex flex-wrap gap-3 mt-2">
        {result.whatsappUrl && <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("ink")}>Lanjutkan ke WhatsApp</a>}
        <button type="button" className={buttonClass("outline")} onClick={() => { reset(); attempt.current = null; setResult(null); }}>Kirim kebutuhan lain</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={(event) => { void handleSubmit(submit)(event); }} noValidate className="grid gap-4" aria-label="Form kebutuhan proyek">
      <h3 className="m-0 text-xl font-semibold">Ceritakan kebutuhan proyek Anda</h3>
      <p className="m-0 text-sm leading-relaxed text-muted">Isi form agar tim kami bisa mempersiapkan konsultasi. Semua kolom berikut wajib diisi.</p>
      {error && <p role="alert" className="m-0 rounded-md border border-red-700/30 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <fieldset disabled={isSubmitting} className="m-0 grid min-w-0 gap-4 border-0 p-0 disabled:opacity-60">
        <div>
          <label htmlFor="inquiry-company" className="text-sm font-semibold">Nama perusahaan / bisnis</label>
          <input id="inquiry-company" autoComplete="organization" maxLength={160} {...register("companyName")} required className={inputClass} aria-invalid={!!errors.companyName} aria-describedby={errors.companyName ? "inquiry-company-error" : undefined} placeholder="Terrace Tech" />
          {errors.companyName && <p id="inquiry-company-error" className="mt-1 text-sm text-red-800">{errors.companyName.message}</p>}
        </div>
        <div>
          <label htmlFor="inquiry-type" className="text-sm font-semibold">Hubungi saya melalui</label>
          <select id="inquiry-type" {...register("contactType")} className={inputClass}>
            <option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option>
          </select>
        </div>
        <div>
          <label htmlFor="inquiry-contact" className="text-sm font-semibold">Nomor WhatsApp atau Email</label>
          <input id="inquiry-contact" type="text" maxLength={500} {...register("contactValue")} required className={inputClass} aria-invalid={!!errors.contactValue} aria-describedby="inquiry-contact-hint inquiry-contact-error" placeholder="Masukan no. Whatsapp atau Email anda" />
          <p id="inquiry-contact-hint" className="mt-1 mb-0 text-xs text-muted">Untuk WhatsApp, sertakan kode negara, contoh +6281234567890.</p>
          <p id="inquiry-contact-error" className="mt-1 mb-0 text-sm text-red-800">{errors.contactValue?.message}</p>
        </div>
        <div>
          <label htmlFor="inquiry-requirements" className="text-sm font-semibold">Kebutuhan proyek</label>
          <textarea id="inquiry-requirements" rows={5} maxLength={2000} {...register("requirements")} required className={inputClass} placeholder="Ceritakan layanan, kendala, atau hasil yang Anda harapkan." aria-invalid={!!errors.requirements} aria-describedby={errors.requirements ? "inquiry-requirements-error" : undefined} />
          {errors.requirements && <p id="inquiry-requirements-error" className="mt-1 text-sm text-red-800">{errors.requirements.message}</p>}
        </div>
        <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label htmlFor="inquiry-website">Website (kosongkan)</label>
          <input id="inquiry-website" {...register("website")} tabIndex={-1} autoComplete="off" />
        </div>
        <p className="m-0 text-xs leading-relaxed text-muted">Data yang Anda kirim digunakan oleh tim Terrace untuk menanggapi kebutuhan dan melakukan tindak lanjut. Jika melanjutkan ke WhatsApp, ringkasan isian akan dibagikan melalui WhatsApp.</p>
        <button type="submit" className={buttonClass("ink", "justify-self-start disabled:cursor-wait")}>
          {isSubmitting ? "Menyimpan…" : "Kirim kebutuhan"}
        </button>
      </fieldset>
    </form>
  );
}
