import type { ReactNode } from "react";

interface HeroSectionProps {
  backgroundHero: string;
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  children?: ReactNode;
}

export function HeroSection(data: HeroSectionProps) {
  return (
    <section
      style={{ backgroundImage: `url('${data.backgroundHero}')` }}
      className="relative w-screen h-screen mt-[11vh] bg-cover bg-center bg-no-repeat"
    >
      <div className="sticky mx-auto top-[calc(100vh-100px)] left-0 px-6 pb-6 w-fit">
        <div className="relative w-fit mx-auto">
          <div
            style={{ backgroundColor: data.backgroundColor }}
            className="absolute top-1.5 left-1.5 w-full h-full"
          />
          <button
            style={{
              backgroundColor: data.primaryColor,
              color: data.textColor,
              borderColor: data.textColor,
            }}
            className="relative px-6 py-3 cursor-pointer border-2 text-center hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-lg"
          >
            AGENDAR AGORA
          </button>
        </div>
      </div>
    </section>
  );
}
