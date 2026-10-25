import { FAQAccordion, type FaqItem } from "./FAQAccordion";
import { headingClass, Kicker } from "./SectionHeading";

const faqs: FaqItem[] = [
  {
    question: "Berapa biaya pembuatan landing page?",
    answer:
      "Paket landing page berkisar Rp500 ribu hingga Rp1,5 juta. Biaya akhir mengikuti kebutuhan desain, jumlah section, dan fitur yang disepakati.",
  },
  {
    question: "Bagaimana menentukan harga management system?",
    answer:
      "Harga ditentukan setelah konsultasi. Kami meninjau kebutuhan fitur, peran pengguna, integrasi, kompleksitas data, dan ruang lingkup pengerjaan sebelum memberikan estimasi.",
  },
  {
    question: "Apakah website bisa disesuaikan dengan identitas bisnis?",
    answer:
      "Ya. Desain, warna, konten, dan struktur halaman disesuaikan dengan kebutuhan serta identitas bisnis Anda.",
  },
  {
    question: "Bagaimana proses memulai proyek?",
    answer:
      "Mulai dengan menghubungi kami. Setelah itu, kita membahas tujuan proyek, kebutuhan, ruang lingkup, estimasi waktu, dan biaya sebelum pengerjaan dimulai.",
  },
  {
    question: "Apakah Terrace menerima integrasi dengan sistem lain?",
    answer:
      "Kebutuhan integrasi dapat dibahas saat konsultasi. Kelayakan dan estimasinya bergantung pada sistem yang digunakan serta akses teknis yang tersedia.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-[100px] max-mobile:py-[70px]">
      <div className="container-site grid grid-cols-[0.75fr_1.25fr] items-start gap-[75px] max-tablet:gap-10 max-mobile:grid-cols-1 max-mobile:gap-8">
        <div>
          <Kicker>FAQ</Kicker>
          <h2 id="faq-title" className={headingClass}>
            Pertanyaan yang sering diajukan.
          </h2>
          <p className="max-w-[300px] text-sm leading-[1.8] text-muted">
            Informasi singkat untuk membantu Anda memahami layanan dan proses kerja Terrace.
          </p>
        </div>
        <FAQAccordion items={faqs} />
      </div>
    </section>
  );
}
