import { Arrow } from "./BrandMark";
import { buttonClass } from "./button";
import { headingClass, Kicker } from "./SectionHeading";

export function AboutSection() {
  return (
    <section
      id="tentang"
      aria-labelledby="tentang-title"
      className="surface-dark bg-ink py-[100px] text-paper max-mobile:py-[70px]"
    >
      <div className="container-site grid grid-cols-[0.9fr_1.1fr] items-start gap-[90px] max-tablet:gap-[45px] max-mobile:grid-cols-1 max-mobile:gap-8">
        <div>
          <Kicker className="text-sand">Tentang Terrace</Kicker>
          <h2 id="tentang-title" className={`${headingClass} max-w-[470px]`}>
            Berawal dari percakapan. Dibangun dengan tujuan.
          </h2>
        </div>
        <div>
          <p className="mt-0 mb-[22px] text-[15px] leading-[1.9] text-on-dark">
            Terrace berawal dari dua anak muda yang bertukar ide di sebuah teras. Dari percakapan
            sederhana, muncul gagasan untuk membangun bisnis teknologi yang membantu perusahaan
            mengelola operasional dengan lebih baik.
          </p>
          <p className="mt-0 mb-[22px] text-[15px] leading-[1.9] text-on-dark">
            Nama Terrace membawa semangat kolaborasi, keterbukaan, dan ruang untuk bertukar
            pikiran. Nilai tersebut menjadi dasar kami dalam merancang setiap solusi.
          </p>
          <a href="#kontak" className={buttonClass("light")}>
            Mulai percakapan <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
