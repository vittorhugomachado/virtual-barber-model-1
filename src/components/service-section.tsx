import { Scissors } from "lucide-react";
import { useBooking } from "../hooks/useBooking";
import { useBarbershop } from "../hooks/useBarbershop";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

export function ServicesSection() {
  const { services, style } = useBarbershop();
  const { openBookingModal } = useBooking();
  const { background_color, primary_color, text_color } = style;

  return (
    <section
      id="servicos"
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
            SERVIÇOS
          </h2>
        </div>

        {/* CARROSSEL */}
        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full px-10"
        >
          <CarouselContent className="-ml-6">
            {services.map((service) => (
              <CarouselItem
                key={service.id}
                className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <button
                  type="button"
                  onClick={() => openBookingModal([service.id])}
                  style={{ borderColor: `${text_color}30` }}
                  className="group h-full w-full cursor-pointer border text-left"
                >
                  <div className="relative overflow-hidden">
                    {service.image_url ? (
                      <img
                        src={service.image_url ?? ""}
                        alt={service.name}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 w-full h-62.5 object-cover"
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: text_color,
                          color: background_color,
                        }}
                        className="flex items-center justify-center h-62.5 opacity-50"
                      >
                        <Scissors size={148} />
                      </div>
                    )}
                  </div>
                  <div
                    style={{ borderColor: primary_color }}
                    className="flex items-center justify-between border-l-2 px-2 py-2"
                  >
                    <h3 className="mt-1 text-xl font-bold uppercase tracking-wide ">
                      {service.name}
                    </h3>
                    <p>{service.duration_min} min</p>
                  </div>
                  <div className="px-3 pb-3 mt-2 gap-2 flex flex-col">
                    <p>{service.description}</p>
                    <p className="font-semibold">
                      {service.price != null
                        ? new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(service.price)
                        : ""}
                    </p>
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            style={{ borderColor: text_color, color: text_color }}
            className="cursor-pointer bg-transparent hover:bg-transparent -left-2 -translate-y-6"
          />
          <CarouselNext
            style={{ borderColor: text_color, color: text_color }}
            className="cursor-pointer bg-transparent hover:bg-transparent -right-2 -translate-y-6"
          />
        </Carousel>
      </div>
    </section>
  );
}
