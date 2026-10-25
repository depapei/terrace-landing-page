import { SectionHead } from "./SectionHeading";

const principles = [
  {
    title: "Pahami prosesnya",
    body: "Kami memulai dengan memahami tantangan dan kebutuhan operasional Anda.",
  },
  {
    title: "Bangun dengan terstruktur",
    body: "Alur sistem dirancang agar mudah digunakan dan dirawat seiring perkembangan bisnis.",
  },
  {
    title: "Kembangkan bersama",
    body: "Kolaborasi membantu solusi terus menyesuaikan diri dengan kebutuhan nyata.",
  },
];

export function PrinciplesSection() {
  return (
    <section id="prinsip" aria-labelledby="prinsip-title" className="py-[100px] max-mobile:py-[70px]">
      <div className="container-site">
        <SectionHead
          id="prinsip-title"
          kicker="Prinsip kerja"
          title={
            <>
              Dirancang dengan
              <br />
              tujuan yang jelas.
            </>
          }
          description="Setiap solusi dimulai dari memahami proses bisnis. Kami menjaga desain sistem tetap jelas, relevan, dan mudah dikembangkan."
        />
        <ol className="m-0 list-none border-t border-line p-0">
          {principles.map((principle, i) => (
            <li key={principle.title} className="flex gap-6 border-b border-line py-[19px]">
              <span className="pt-[3px] text-[11px] font-semibold text-sand-deep" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mb-1.5 text-sm font-bold">{principle.title}</h3>
                <p className="m-0 text-xs leading-[1.6] text-muted">{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
