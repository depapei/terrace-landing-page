// Contact details are configured per environment. Placeholders from the HTML
// mockup are intentionally not shipped; when a value is unset the UI hides it.
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
const whatsappDigits =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.replace(/\D/g, "") || null;

export const siteConfig = {
  name: "Terrace",
  legalName: "PT. Teras Teknologi",
  title: "Terrace | Digital Solutions for Better Business",
  description:
    "Terrace membangun website dan software management system untuk membantu bisnis bekerja lebih terstruktur.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  contact: {
    email,
    emailHref: email ? `mailto:${email}` : null,
    whatsapp: whatsappDigits ? `+${whatsappDigits}` : null,
    whatsappHref: whatsappDigits ? `https://wa.me/${whatsappDigits}` : null,
  },
} as const;

/** WhatsApp chat link with a prefilled message, or null when no number is configured. */
export function whatsappChatHref(message: string) {
  const { whatsappHref } = siteConfig.contact;
  return whatsappHref ? `${whatsappHref}?text=${encodeURIComponent(message)}` : null;
}

/** Primary contact destination: email when configured, otherwise the on-page contact section. */
export function primaryContactHref(subject?: string) {
  const { emailHref } = siteConfig.contact;
  if (!emailHref) return "#kontak";
  return subject ? `${emailHref}?subject=${encodeURIComponent(subject)}` : emailHref;
}
