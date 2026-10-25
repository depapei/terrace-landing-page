import { Arrow } from "./BrandMark";
import { buttonClass } from "./button";

export function HeroIntro() {
  return (
    <div className="surface-dark">
      <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[2px] text-sand before:h-px">
        PT. Teras Teknologi
      </p>
      <h1 className="mt-[22px] mb-5 max-w-[590px] text-[clamp(45px,6.4vw,82px)] font-semibold leading-[1.02] tracking-[-4px] max-mobile:text-[clamp(40px,12vw,62px)] max-mobile:tracking-[-2.8px]">
        Teknologi yang membuat bisnis bergerak lebih baik.
      </h1>
      <p className="max-w-[460px] text-[15px] leading-[1.85] text-white/78 max-mobile:text-sm">
        Kami membantu bisnis membangun website dan sistem manajemen yang sesuai dengan kebutuhan
        operasional, dari kehadiran digital hingga proses kerja yang kompleks.
      </p>
      <div className="mt-[29px] flex flex-wrap gap-3">
        <a href="#paket" className={buttonClass("sand")}>
          Lihat pilihan paket <Arrow />
        </a>
        <a href="#tentang" className={buttonClass("light")}>
          Kenali Terrace
        </a>
      </div>
    </div>
  );
}
