import { ImageResponse } from "next/og";

export const alt = "Terrace — Teknologi yang membuat bisnis bergerak lebih baik.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#1C1C1C",
          color: "#F7F5F0",
          fontFamily: "sans-serif",
        }}
      >
        {/* terrace-logo-reversed.svg */}
        <svg width="366" height="120" viewBox="0 0 244 80">
          <g transform="translate(8 8)">
            <path fill="#CAC4BB" d="M4 8H30V44H22V18H4Z" />
            <path fill="#CAC4BB" d="M60 16H34V44H42V26H60Z" />
            <rect fill="#EAD8AB" x="4" y="50" width="56" height="6" />
          </g>
          <g fill="none" stroke="#CAC4BB" strokeWidth="5">
            <path d="M96 30.5H118M107 28V56" />
            <path d="M123.5 46H138.5A7.5 7.5 0 1 0 136.3 51.3" />
            <path d="M147.5 56V36M147.5 45.5C147.5 40.5 151 38.5 156 38.5" />
            <path d="M160 56V36M160 45.5C160 40.5 163.5 38.5 168.5 38.5" />
            <circle cx="181" cy="46" r="7.5" />
            <path d="M188.5 36V56" />
            <path d="M209.3 40.7A7.5 7.5 0 1 0 209.3 51.3" />
            <path d="M217.5 46H232.5A7.5 7.5 0 1 0 230.3 51.3" />
          </g>
        </svg>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, color: "#EAD8AB", textTransform: "uppercase" }}>
            PT. Teras Teknologi
          </div>
          <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, letterSpacing: -3, maxWidth: 900 }}>
            Teknologi yang membuat bisnis bergerak lebih baik.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
