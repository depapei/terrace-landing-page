import { whatsappChatHref } from "@/lib/site-config";

/** Floating "Butuh bantuan?" WhatsApp shortcut. Renders nothing when no number is configured. */
export function WhatsAppButton() {
  const href = whatsappChatHref("Halo Terrace, saya butuh bantuan terkait layanan Anda.");
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Butuh bantuan? Chat Terrace via WhatsApp (tab baru)"
      className="surface-dark fixed right-[max(16px,env(safe-area-inset-right))] bottom-[max(16px,env(safe-area-inset-bottom))] z-[900] inline-flex items-center gap-2.5 rounded-full border border-white/14 bg-ink py-2 pr-4 pl-2 text-[13px] font-semibold text-paper shadow-[0_10px_30px_rgb(0_0_0/0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-ink-soft max-mobile:pr-2"
    >
      <span className="grid size-9 place-items-center rounded-full bg-[#25D366] text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35ZM12.05 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.95-3.48-.22-.36A9.44 9.44 0 0 1 2.6 12.05C2.6 6.84 6.84 2.6 12.06 2.6c2.52 0 4.9.99 6.68 2.77a9.4 9.4 0 0 1 2.76 6.69c0 5.21-4.24 9.45-9.45 9.45Zm8.04-17.49A11.3 11.3 0 0 0 12.05.7C5.8.7.7 5.8.7 12.05c0 2 .52 3.95 1.52 5.67L.6 23.3l5.7-1.5a11.33 11.33 0 0 0 5.75 1.47h.01c6.26 0 11.35-5.1 11.35-11.35 0-3.03-1.18-5.88-3.32-8.02Z" />
        </svg>
      </span>
      <span className="max-mobile:sr-only">Butuh bantuan?</span>
    </a>
  );
}
