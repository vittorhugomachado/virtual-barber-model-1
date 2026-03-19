import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

interface Service {
  name: string;
  image: string;
}

interface ServicesSectionProps {
  backgroundColor: string;
  primaryColor: string;
  textColor: string;
  services: Service[];
}

export function ServicesSection({
  backgroundColor,
  primaryColor,
  textColor,
  services,
}: ServicesSectionProps) {
  return (
    <section
      id="servicos"
      style={{ backgroundColor, color: textColor }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        {/* TÍTULO */}
        <div className="w-full flex justify-center mb-6">
          <h2
            style={{ borderColor: primaryColor }}
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
            {services.map((service, index) => (
              <CarouselItem
                key={index}
                className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden">
                    <div
                      style={{ backgroundColor: primaryColor }}
                      className="absolute top-2 left-2 w-full h-full z-0 transition-all duration-300 group-hover:top-1 group-hover:left-1"
                    />
                    <img
                      src={service.image}
                      alt={service.name}
                      className="relative z-10 w-full h-62.5 object-cover"
                    />
                  </div>
                  <h3
                    style={{ borderColor: primaryColor }}
                    className="mt-1 text-xl font-bold uppercase tracking-wide border-l-2 pl-2 pt-3"
                  >
                    {service.name}
                  </h3>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious
            style={{ borderColor: textColor, color: textColor }}
            className="cursor-pointer bg-transparent hover:bg-transparent -left-2 -translate-y-6"
          />
          <CarouselNext
            style={{ borderColor: textColor, color: textColor }}
            className="cursor-pointer bg-transparent hover:bg-transparent -right-2 -translate-y-6"
          />
        </Carousel>
      </div>
    </section>
  );
}
