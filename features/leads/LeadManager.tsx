"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Tag } from "antd";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AntForm, FormError, RadioInput, SubmitBar, TextAreaInput, TextInput } from "@/components/admin/form-fields";
import { applyServerErrors } from "@/components/admin/form-utils";
import { Modal } from "@/components/admin/Modal";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/QueryState";
import { useToast } from "@/components/admin/Toast";
import { adminButton } from "@/components/admin/ui";
import { useLead, useLeadMutation, useLeads } from "./hooks";
import { contactLabels, contactTypes, leadProgressSchema, leadStatuses, potentialLeadUpdateSchema, statusLabels, type LeadDetail, type LeadSource, type LeadStatus, type LeadSummary } from "./schema";

const controlClass = "rounded-md border border-line bg-white px-3 py-2 text-sm";
const date = (value: string) => new Date(value).toLocaleString("id-ID");
const statusColors: Record<LeadStatus, string> = {
  NEW: "blue", CONTACTED: "cyan", FOLLOW_UP: "gold", INTERESTED: "purple", CONVERTED: "green", LOST: "default",
};

export function LeadManager() {
  const [source, setSource] = useState<LeadSource>("POTENTIAL");
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<LeadSummary | null>(null);
  const query = useLeads({ source, status: status || undefined, search, page });
  const detail = useLead(selectedId);
  const mutation = useLeadMutation();
  const toast = useToast();
  const data = query.data;

  const saved = () => { setCreateOpen(false); setSelectedId(null); toast("success", "Lead berhasil disimpan."); };

  return (
    <>
      <PageHeader title="Lead Management" description="Catat prospek dan tindak lanjuti kebutuhan yang masuk dari website. Semua admin memiliki akses ke seluruh lead." action={source === "POTENTIAL" && <button type="button" className={adminButton("primary")} onClick={() => setCreateOpen(true)}>Tambah potential lead</button>} />
      <div aria-label="Sumber lead" className="mb-5 flex gap-2">
        {(["POTENTIAL", "SELF_FORM"] as const).map((value) => <button key={value} type="button" aria-pressed={source === value} className={adminButton(source === value ? "primary" : "secondary")} onClick={() => { setSource(value); setPage(1); }}>{value === "POTENTIAL" ? "Potential Leads" : "Self Form"}</button>)}
      </div>
      <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); setPage(1); }}>
        <div className="grid grow gap-1">
          <label htmlFor="lead-search" className="text-xs font-semibold">Cari nama perusahaan</label>
          <input id="lead-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} maxLength={160} className={controlClass} placeholder="Nama perusahaan…" />
        </div>
        <button className={adminButton("secondary")} type="submit">Cari</button>
        <div className="grid gap-1">
          <label htmlFor="lead-status-filter" className="text-xs font-semibold">Status</label>
          <select id="lead-status-filter" className={controlClass} value={status} onChange={(event) => { setStatus(event.target.value as LeadStatus | ""); setPage(1); }}>
            <option value="">Semua status</option>
            {leadStatuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
          </select>
        </div>
      </form>
      {query.isPending ? <LoadingRows /> : query.isError ? <ErrorState message={query.error.message} onRetry={() => query.refetch()} /> : data && (
        <>
          {data.items.length === 0 ? <EmptyState title="Tidak ada lead">{search || status ? "Ubah pencarian atau filter status." : source === "POTENTIAL" ? "Tambahkan prospek pertama dari hasil prospecting tim." : "Kebutuhan yang dikirim melalui form website akan tampil di sini."}</EmptyState> : (
            <div className="overflow-x-auto rounded-lg border border-line bg-white">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <caption className="sr-only">Daftar {source === "POTENTIAL" ? "potential leads" : "self form"}</caption>
                <thead className="bg-sand/40"><tr>{["Perusahaan", "Kontak", "Status", "Tanggal masuk", "Aksi"].map((label) => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
                <tbody>{data.items.map((lead) => (
                  <tr key={lead.id} className="border-t border-line align-top">
                    <td className="max-w-[240px] break-words px-4 py-3 font-semibold">{lead.companyName}</td>
                    <td className="max-w-[260px] break-all px-4 py-3"><span className="block text-xs text-muted">{contactLabels[lead.contactType]}</span>{lead.contactValue}</td>
                    <td className="px-4 py-3"><Tag color={statusColors[lead.status]}>{statusLabels[lead.status]}</Tag></td>
                    <td className="px-4 py-3 text-xs text-muted">{date(lead.createdAt)}</td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button type="button" className={adminButton("secondary")} onClick={() => setSelectedId(lead.id)} aria-label={`Detail ${lead.companyName}`}>Detail / edit</button>
                      {lead.source === "POTENTIAL" && <button type="button" className={adminButton("ghost")} onClick={() => setDeleting(lead)} aria-label={`Hapus ${lead.companyName}`}>Hapus</button>}
                    </div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span aria-live="polite">{data.total} lead · Halaman {data.page} dari {Math.max(1, Math.ceil(data.total / data.pageSize))}</span>
            <div className="flex gap-2">
              <button type="button" className={adminButton("secondary")} disabled={page <= 1 || query.isFetching} onClick={() => setPage(page - 1)}>Sebelumnya</button>
              <button type="button" className={adminButton("secondary")} disabled={page * data.pageSize >= data.total || query.isFetching} onClick={() => setPage(page + 1)}>Berikutnya</button>
            </div>
          </div>
        </>
      )}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah potential lead" size="lg">
        {createOpen && <PotentialForm lead={null} onDone={saved} />}
      </Modal>
      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title="Detail lead" size="lg">
        {selectedId && (detail.isPending ? <LoadingRows /> : detail.isError ? <ErrorState message={detail.error.message} onRetry={() => detail.refetch()} /> : detail.data && <>
          <p className="text-xs text-muted">Masuk: {date(detail.data.createdAt)} · Diperbarui: {date(detail.data.updatedAt)}</p>
          {detail.data.source === "POTENTIAL" ? <PotentialForm key={detail.data.id} lead={detail.data} onDone={saved} /> : <SelfFormDetail key={detail.data.id} lead={detail.data} onDone={saved} />}
        </>)}
      </Modal>
      <ConfirmDialog open={!!deleting} title="Hapus potential lead?" description={`Data ${deleting?.companyName ?? ""} akan dihapus permanen.`} pending={mutation.isPending} onCancel={() => { if (!mutation.isPending) setDeleting(null); }} onConfirm={async () => {
        if (!deleting || mutation.isPending) return;
        try {
          await mutation.mutateAsync({ method: "delete", id: deleting.id });
          setDeleting(null);
          if (data?.items.length === 1 && page > 1) setPage(page - 1);
          toast("success", "Lead dihapus.");
        } catch (error) { toast("error", error instanceof Error ? error.message : "Gagal menghapus lead."); }
      }} />
    </>
  );
}

function PotentialForm({ lead, onDone }: { lead: LeadDetail | null; onDone: () => void }) {
  const mutation = useLeadMutation();
  const [error, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(potentialLeadUpdateSchema),
    defaultValues: {
      companyName: lead?.companyName ?? "", contactType: lead?.contactType ?? "EMAIL",
      contactValue: lead?.contactValue ?? "", requirements: lead?.requirements ?? "",
      internalNotes: lead?.internalNotes ?? "", status: lead?.status ?? "NEW",
    },
  });
  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (lead) await mutation.mutateAsync({ method: "update", id: lead.id, input: values });
      else await mutation.mutateAsync({ method: "create", input: {
        companyName: values.companyName, contactType: values.contactType, contactValue: values.contactValue,
        requirements: values.requirements, internalNotes: values.internalNotes,
      } });
      onDone();
    } catch (caught) {
      setFormError(applyServerErrors(caught, setError, ["companyName", "contactType", "contactValue", "requirements", "internalNotes", "status"]).formError);
    }
  });
  return <AntForm onSubmit={submit}>
    <FormError message={error} />
    <TextInput control={control} name="companyName" label="Nama perusahaan" required maxLength={160} />
    <RadioInput control={control} name="contactType" label="Jenis kontak" options={contactTypes.map((value) => ({ value, label: contactLabels[value] }))} />
    <TextInput control={control} name="contactValue" label="Kontak utama" required maxLength={500} hint="WhatsApp: kode negara + nomor. Website / Google Maps: URL http(s). Instagram: username atau URL profil." />
    <TextAreaInput control={control} name="requirements" label="Kebutuhan (opsional)" maxLength={2000} />
    <TextAreaInput control={control} name="internalNotes" label="Catatan internal" maxLength={5000} hint="Hanya dapat dilihat admin." />
    {lead ? <RadioInput control={control} name="status" label="Status" options={leadStatuses.map((value) => ({ value, label: statusLabels[value] }))} /> : <p className="text-sm text-muted">Status awal: New</p>}
    <SubmitBar pending={isSubmitting} />
  </AntForm>;
}

function SelfFormDetail({ lead, onDone }: { lead: LeadDetail; onDone: () => void }) {
  const mutation = useLeadMutation();
  const [error, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, setError, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(leadProgressSchema),
    defaultValues: { status: lead.status, internalNotes: lead.internalNotes ?? "" },
  });
  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try { await mutation.mutateAsync({ method: "progress", id: lead.id, input: values }); onDone(); }
    catch (caught) { setFormError(applyServerErrors(caught, setError, ["status", "internalNotes"]).formError); }
  });
  return <>
    <dl className="mb-6 grid gap-3 rounded-lg border border-line bg-sand/20 p-4 text-sm">
      <div><dt className="font-semibold">Perusahaan</dt><dd className="m-0 break-words">{lead.companyName}</dd></div>
      <div><dt className="font-semibold">{contactLabels[lead.contactType]}</dt><dd className="m-0 break-all">{lead.contactValue}</dd></div>
      <div><dt className="font-semibold">Kebutuhan dari customer</dt><dd className="m-0 whitespace-pre-wrap break-words">{lead.requirements}</dd></div>
    </dl>
    <p className="text-xs text-muted">Isian asli customer disimpan tanpa perubahan. Anda dapat memperbarui status dan catatan internal.</p>
    <AntForm onSubmit={submit}>
      <FormError message={error} />
      <RadioInput control={control} name="status" label="Status" options={leadStatuses.map((value) => ({ value, label: statusLabels[value] }))} />
      <TextAreaInput control={control} name="internalNotes" label="Catatan internal" maxLength={5000} hint="Hanya dapat dilihat admin." />
      <SubmitBar pending={isSubmitting} />
    </AntForm>
  </>;
}
