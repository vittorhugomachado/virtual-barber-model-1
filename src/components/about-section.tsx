import { useBarbershop } from "../hooks/useBarbershop";

export function AboutSection() {
  const { description, logo_url, style } = useBarbershop();
  const { background_color, primary_color, text_color } = style;

  if (!description) return null;

  return (
    <section
      id="sobre"
      style={{ backgroundColor: background_color, color: text_color }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24 overflow-hidden"
    >
      <div className="max-w-350 mx-auto">
        <div className="mb-6 md:mb-12 lg:ml-18 xl:ml-56">
          <h2
            style={{ borderColor: primary_color }}
            className="inline text-[40px] pr-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            SOBRE
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-14 lg:gap-20 items-center justify-center">
          {logo_url && (
            <div className="relative w-fit">
              <div
                style={{ backgroundColor: primary_color }}
                className="absolute -bottom-2.5 left-2.5 w-full h-full z-0"
              />
              <img
                src={logo_url}
                alt="Interior da barbearia"
                style={{ borderColor: text_color }}
                className="relative z-10 w-full max-w-125 h-auto object-cover block border-3"
              />
            </div>
          )}

          <div className="flex flex-col justify-between h-full">
            <p className="text-lg md:text-xl font-semibold leading-[1.6] whitespace-pre-line max-w-110">
              {description}
            </p>
            <div className="relative w-fit mt-6">
              <div
                style={{ backgroundColor: text_color }}
                className="absolute top-1.5 left-1.5 w-full h-full"
              />
              <button
                style={{
                  backgroundColor: primary_color,
                  color: text_color,
                  borderColor: background_color,
                }}
                className="relative px-6 py-3 cursor-pointer border-2 text-center hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200 font-bold shadow-lg"
              >
                AGENDAR AGORA
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
