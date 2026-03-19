import { useBarbershop } from "../hooks/useBarbershop";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";

export function TeamSection() {
  const { barbers, style } = useBarbershop();
  const { background_color, primary_color, text_color } = style;

  return (
    <section
      id="equipe"
      style={{ backgroundColor: background_color, color: text_color }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        {/* TÍTULO */}
        <div className="w-full flex justify-center mb-6">
          <h2
            style={{ borderColor: primary_color }}
            className="inline mx-auto text-[40px] px-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            EQUIPE
          </h2>
        </div>

        {/* CARROSSEL */}
        <Carousel opts={{ align: "start", loop: true }} className="w-full px-10">
          <CarouselContent className="-ml-6">
            {barbers.map((barber) => {
              const visibleServices = barber.services.slice(0, 3);
              const extraCount = barber.services.length - 3;

              return (
                <CarouselItem
                  key={barber.id}
                  className="pl-6 max-w-73 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div
                    style={{ borderColor: `${text_color}30` }}
                    className="group relative flex flex-col border"
                  >
                    {/* FOTO */}
                    <div className="relative overflow-hidden">
                      <div
                        style={{ backgroundColor: primary_color }}
                        className="absolute top-2 left-2 w-full h-full z-0 transition-all duration-300 group-hover:top-1 group-hover:left-1"
                      />
                      <img
                        src={barber.avatar_url ?? ""}
                        alt={barber.name}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 w-full h-70 object-cover object-top"
                      />
                    </div>

                    {/* NOME */}
                    <h3
                      style={{ borderColor: primary_color }}
                      className="text-xl text-center font-black uppercase tracking-wide border-t-4 pt-2"
                    >
                      {barber.name}
                    </h3>

                    {/* SERVIÇOS */}
                    <div className="mt-3 flex flex-wrap gap-2 items-center justify-center p-3">
                      {visibleServices.map((service, i) => (
                        <span
                          key={i}
                          style={{ borderColor: primary_color, color: text_color }}
                          className="text-xs text-center grow font-semibold uppercase tracking-wider border px-2 py-1"
                        >
                          {service}
                        </span>
                      ))}

                      {extraCount > 0 && (
                        <span
                          style={{ backgroundColor: primary_color, color: text_color }}
                          className="text-xs font-black uppercase px-2 py-1 cursor-pointer"
                        >
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            style={{ borderColor: text_color, color: text_color }}
            className="cursor-pointer bg-transparent hover:bg-transparent -left-2"
          />
          <CarouselNext
            style={{ borderColor: text_color, color: text_color }}
            className="cursor-pointer bg-transparent hover:bg-transparent -right-2"
          />
        </Carousel>
      </div>
    </section>
  );
}
