"use client";

import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { PageHeader } from "./AdminShell";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";
import { EmptyState, ErrorState, LoadingRows } from "./QueryState";
import { ResourceList, type RowView } from "./ResourceList";
import { useToast } from "./Toast";
import { adminButton, DEFAULT_STATUS_LABELS, type StatusLabels } from "./ui";

type Item = { id: string; isActive: boolean };

type FormState<T> = { mode: "create" } | { mode: "edit"; item: T } | null;

/**
 * Shared page scaffolding for a CMS resource: list with loading/empty/error
 * states, create/edit modal, delete confirmation, active toggle and reorder.
 */
export function ResourceManager<T extends Item>({
  title,
  description,
  noun,
  query,
  setActive,
  remove,
  reorder,
  view,
  renderForm,
  renderView,
  emptyHint,
  statusLabels = DEFAULT_STATUS_LABELS,
}: {
  title: string;
  description: string;
  noun: string;
  query: UseQueryResult<T[]>;
  setActive: UseMutationResult<T, Error, { id: string; isActive: boolean }, unknown>;
  remove: UseMutationResult<void, Error, string, unknown>;
  reorder: UseMutationResult<void, Error, string[], unknown>;
  view: (item: T) => RowView;
  renderForm: (props: { item: T | null; onDone: (message: string) => void }) => ReactNode;
  /** Read-only detail; when given, each row gets a "Lihat" action. */
  renderView?: (item: T) => ReactNode;
  emptyHint?: ReactNode;
  statusLabels?: StatusLabels;
}) {
  const notify = useToast();
  const [form, setForm] = useState<FormState<T>>(null);
  const [viewing, setViewing] = useState<T | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);

  const onError = (error: Error) => notify("error", error.message);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <button type="button" className={adminButton("primary")} onClick={() => setForm({ mode: "create" })}>
            + Tambah {noun}
          </button>
        }
      />

      {query.isPending ? (
        <LoadingRows />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState title={`Belum ada ${noun}.`}>{emptyHint}</EmptyState>
      ) : (
        <ResourceList
          items={query.data}
          view={view}
          reordering={reorder.isPending}
          statusLabels={statusLabels}
          onView={renderView && setViewing}
          onEdit={(item) => setForm({ mode: "edit", item })}
          onDelete={setToDelete}
          onToggle={(item) =>
            setActive.mutate(
              { id: item.id, isActive: !item.isActive },
              {
                onSuccess: (updated) =>
                  notify(
                    "success",
                    `${view(updated).title} ${updated.isActive ? statusLabels.activated : statusLabels.deactivated}.`,
                  ),
                onError,
              },
            )
          }
          onReorder={(ids) =>
            reorder.mutate(ids, { onSuccess: () => notify("success", "Urutan disimpan."), onError })
          }
        />
      )}

      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.mode === "edit" ? `Edit ${noun}` : `Tambah ${noun}`}
        size="lg"
      >
        {form &&
          renderForm({
            item: form.mode === "edit" ? form.item : null,
            onDone: (message) => {
              setForm(null);
              notify("success", message);
            },
          })}
      </Modal>

      {renderView && (
        <Modal
          open={viewing !== null}
          onClose={() => setViewing(null)}
          title={viewing ? view(viewing).title : ""}
          size="lg"
        >
          {viewing && renderView(viewing)}
        </Modal>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title={`Hapus ${noun}?`}
        description={
          toDelete
            ? `"${view(toDelete).title}" akan dihapus permanen beserta gambarnya. Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        pending={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              notify("success", `${view(toDelete).title} dihapus.`);
              setToDelete(null);
            },
            onError,
          });
        }}
      />
    </>
  );
}
