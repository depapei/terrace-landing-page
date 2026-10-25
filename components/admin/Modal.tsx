"use client";

import { Modal as AntModal } from "antd";
import type { ReactNode } from "react";

const WIDTHS = { sm: 440, md: 600, lg: 760 } as const;

/** Content modal (Ant Design). Body unmounts on close so forms reset. */
export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: keyof typeof WIDTHS;
}) {
  return (
    <AntModal
      open={open}
      onCancel={onClose}
      title={title}
      footer={null}
      width={WIDTHS[size]}
      destroyOnHidden
      mask={{ closable: true }}
      centered
    >
      {children}
    </AntModal>
  );
}
