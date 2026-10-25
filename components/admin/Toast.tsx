"use client";

import { App } from "antd";
import { useCallback } from "react";

/** Success/error feedback via Ant Design `message` (context-aware, themed). */
export function useToast() {
  const { message } = App.useApp();
  return useCallback(
    (kind: "success" | "error", text: string) => {
      if (kind === "success") message.success(text);
      else message.error(text);
    },
    [message],
  );
}
