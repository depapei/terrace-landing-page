"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, type ThemeConfig } from "antd";
import idID from "antd/locale/id_ID";
import type { ReactNode } from "react";

// Terrace tokens (doc/DESIGN.md §3) mapped onto Ant Design's theme.
const theme: ThemeConfig = {
  token: {
    colorPrimary: "#1C1C1C",
    colorInfo: "#1C1C1C",
    colorLink: "#1C1C1C",
    colorText: "#1C1C1C",
    colorTextSecondary: "#77736D",
    colorBorder: "rgba(28, 28, 28, 0.18)",
    colorBorderSecondary: "rgba(28, 28, 28, 0.1)",
    colorBgLayout: "#F7F5F0",
    borderRadius: 6,
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    fontSize: 14,
  },
  components: {
    Button: { primaryShadow: "none", defaultShadow: "none", dangerShadow: "none" },
    Modal: { titleFontSize: 20 },
    Form: { labelFontSize: 13, verticalLabelPadding: "0 0 6px" },
  },
};

/** Ant Design styles (SSR-extracted), theme, Indonesian locale and App context. */
export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme} locale={idID}>
        {/*
          component={false}: no wrapper element. antd scopes its base styles
          (e.g. `:where(.css-…) a { color: colorLink; outline: none }`) to its
          root class; a wrapper around the whole admin would recolor every
          non-antd link (the CMS header nav) and drop their focus outline.
        */}
        <App component={false}>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
