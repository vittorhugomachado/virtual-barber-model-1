import { useEffect, useState } from "react";
import { User, X } from "lucide-react";
import { useBarbershop } from "../../../hooks/useBarbershop";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../components/ui/carousel";
import type { Barber } from "../../../types/barbershop.types";

function BarberPortrait({
  barber,
  backgroundColor,
  foregroundColor,
  className,
}: {
  barber: Barber;
  backgroundColor: string;
  foregroundColor: string;
  className: string;
}) {
  if (barber.avatar_url) {
    return (
      <img
        src={barber.avatar_url}
        alt={barber.name}
        loading="lazy"
        decoding="async"
        className={className}
      />
    );
  }

  return (
    <div
      style={{
        backgroundColor: foregroundColor,
        color: backgroundColor,
      }}
      className={`flex items-center justify-center opacity-50 ${className}`}
    >
      <User size={148} />
    </div>
  );
}

export function TeamSection() {
  const { barbers, style } = useBarbershop();
  const { background_color, primary_color, text_color } = style;
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);

  useEffect(() => {
    if (!selectedBarber) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBarber(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedBarber]);

  return (
    <>
      <section
        id="equipe"
        style={{ backgroundColor: background_color, color: text_color }}
        className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
      >
        <div className="max-w-350 mx-auto">
          <div className="mb-6 flex w-full justify-center">
            <h2
              style={{ borderColor: primary_color }}
              className="inline mx-auto border-b-4 px-8 text-[40px] font-black uppercase leading-none tracking-tight sm:text-[52px]"
            >
              EQUIPE
            </h2>
          </div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full px-10 py-2"
          >
            <CarouselContent className="-ml-6 pt-1">
              {barbers.map((barber) => {
                const visibleServices = barber.services.slice(0, 3);
                const extraCount = barber.services.length - 3;

                return (
                  <CarouselItem
                    key={barber.id}
                    className="max-w-73 basis-full pl-6 sm:basis-1/2 lg:basis-1/3 cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedBarber(barber)}
                      style={{ borderColor: `${text_color}30` }}
                      className="group cursor-pointer relative flex h-full w-full flex-col overflow-x-hidden border text-left transition-transform duration-200 hover:-translate-y-1"
                    >
                      <div className="relative overflow-hidden">
                        <BarberPortrait
                          barber={barber}
                          backgroundColor={background_color}
                          foregroundColor={text_color}
                          className="relative z-10 h-70 w-full object-cover object-top"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <h3
                          style={{ borderColor: primary_color }}
                          className="border-t-4 pt-2 text-center text-xl font-black uppercase tracking-wide"
                        >
                          {barber.name}
                        </h3>

                        <div className="flex flex-wrap items-center justify-center gap-2 p-3">
                          {visibleServices.map((service, index) => (
                            <span
                              key={`${barber.id}-${index}`}
                              style={{
                                backgroundColor: text_color,
                                color: background_color,
                              }}
                              className="grow border px-2 py-1 text-center text-xs font-semibold uppercase tracking-wider"
                            >
                              {service}
                            </span>
                          ))}

                          {extraCount > 0 && (
                            <span
                              style={{
                                borderColor: text_color,
                                color: text_color,
                              }}
                              className="border-2 px-2 py-1 text-xs font-black uppercase"
                            >
                              +{extraCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <CarouselPrevious
              style={{ borderColor: text_color, color: text_color }}
              className="-left-2 cursor-pointer bg-transparent hover:bg-transparent"
            />
            <CarouselNext
              style={{ borderColor: text_color, color: text_color }}
              className="-right-2 cursor-pointer bg-transparent hover:bg-transparent"
            />
          </Carousel>
        </div>
      </section>

      {selectedBarber && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4 py-8"
          onClick={() => setSelectedBarber(null)}
        >
          <div
            style={{
              backgroundColor: background_color,
              color: text_color,
              borderColor: text_color,
            }}
            className="relative max-h-[90vh] w-full max-w-76 md:max-w-3xl overflow-auto border-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedBarber(null)}
              style={{ color: text_color, borderColor: `${text_color}30` }}
              className="absolute top-4 right-4 z-10 cursor-pointer border p-2 hover:bg-red-400 transition-all duration-300"
              aria-label="Fechar modal"
            >
              <X className="size-5" />
            </button>

            <div className="grid gap-0 md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
              <div style={{borderColor: primary_color}} className="relative min-h-80 overflow-hidden border-b-6 md:border-b-0 md:border-r-6">
                <BarberPortrait
                  barber={selectedBarber}
                  backgroundColor={background_color}
                  foregroundColor={text_color}
                  className="relative z-10 h-full min-h-80 w-full object-cover object-top"
                />
              </div>

              <div className="flex flex-col gap-6 p-6 md:p-8">
                <div>
                  <p
                    style={{ color: text_color }}
                    className="mb-2 text-xs font-bold uppercase tracking-[0.3em]"
                  >
                    Barbeiro
                  </p>
                  <h3 className="text-3xl font-black uppercase leading-none">
                    {selectedBarber.name}
                  </h3>
                </div>

                <div>
                  <p
                    style={{ color: text_color }}
                    className="mb-4 text-xs font-bold uppercase tracking-[0.3em]"
                  >
                    Servicos
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {selectedBarber.services.length > 0 ? (
                      selectedBarber.services.map((service) => (
                        <span
                          key={`${selectedBarber.id}-${service}`}
                          style={{
                            backgroundColor: text_color,
                            color: background_color,
                          }}
                          className="px-3 py-2 text-sm font-bold uppercase tracking-wider"
                        >
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold uppercase tracking-wider opacity-70">
                        Nenhum servico cadastrado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
