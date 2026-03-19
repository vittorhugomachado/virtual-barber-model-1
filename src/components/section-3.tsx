interface Service {
  name: string;
  image: string;
}

interface Section3Props {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
  services: Service[];
}

export function Section3({
  backgroundColor,
  primaryColor,
  textColor,
  services,
}: Section3Props) {
  return (
    <section
      id="servicos"
      style={{ backgroundColor, color: textColor }}
      className="scroll-mt-[11vh] w-full min-h-screen px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        {/* TÍTULO */}
        <div className="mb-10 md:mb-14">
          <h2
            style={{ borderColor: primaryColor }}
            className="inline text-[40px] pr-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            SERVIÇOS
          </h2>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden">
                {/* fundo deslocado */}
                <div
                  style={{ backgroundColor: primaryColor }}
                  className="absolute top-2 left-2 w-full h-full z-0 transition-all duration-300 group-hover:top-1 group-hover:left-1"
                />

                {/* imagem */}
                <img
                  src={service.image}
                  alt={service.name}
                  className="relative z-10 w-full h-62.5 object-cover"
                />
              </div>

              {/* nome */}
              <h3 className="mt-4 text-xl font-bold uppercase tracking-wide">
                {service.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
