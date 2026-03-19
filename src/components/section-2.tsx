interface Section2Props {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
  description: string;
  imageSection2: string;
}

export function Section2({
  backgroundColor,
  primaryColor,
  textColor,
  description,
  imageSection2,
}: Section2Props) {
  return (
    <section
      id="sobre"
      style={{ backgroundColor, color: textColor }}
      className="scroll-mt-[11vh] w-full min-h-screen px-6 md:px-10 lg:px-16 py-16 md:py-24 overflow-hidden"
    >
      <div className="max-w-350 mx-auto">
        <div className="mb-6 md:mb-12 lg:ml-18 xl:ml-56">
          <h2
            style={{ borderColor: primaryColor }}
            className="inline text-[40px] pr-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            SOBRE
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-14 lg:gap-20 items-center justify-center">
          <div className="relative w-fit">
            <div
              style={{ backgroundColor: primaryColor }}
              className="absolute -bottom-2.5 left-2.5 w-full h-full z-0"
            />

            <img
              src={imageSection2}
              alt="Interior da barbearia"
              style={{ borderColor: textColor }}
              className="relative z-10 w-full max-w-125 h-auto object-cover block border-3"
            />
          </div>

          <div className="flex flex-col justify-between h-full">
            <p className="text-lg md:text-xl font-semibold leading-[1.6] whitespace-pre-line max-w-110">
              {description}
            </p>
            <div className="relative w-fit mt-6">
              <div
                style={{ backgroundColor: textColor }}
                className="absolute top-1.5 left-1.5 w-full h-full"
              />
              <button
                style={{
                  backgroundColor: primaryColor,
                  color: textColor,
                  borderColor: backgroundColor,
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
