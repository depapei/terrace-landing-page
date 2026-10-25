"use client";

import { ExclamationCircleFilled } from "@ant-design/icons";
import { Modal } from "antd";

/** Destructive-action confirmation (Ant Design Modal); Cancel gets initial focus. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      title={
        <span className="inline-flex items-center gap-2">
          <ExclamationCircleFilled className="text-red-700" aria-hidden />
          {title}
        </span>
      }
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmLabel}
      cancelText="Batal"
      okButtonProps={{ danger: true }}
      cancelButtonProps={{ autoFocus: true }}
      confirmLoading={pending}
      width={440}
      centered
      destroyOnHidden
      mask={{ closable: true }}
    >
      <p className="mt-2 mb-0 text-sm leading-relaxed text-muted">{description}</p>
    </Modal>
  );
}
