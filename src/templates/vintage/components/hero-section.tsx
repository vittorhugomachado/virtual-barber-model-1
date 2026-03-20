import { useBarbershop } from "../../../hooks/useBarbershop";
import { useBooking } from "../../../hooks/useBooking";

export function HeroSection() {
  const { banner_url, style } = useBarbershop();
  const { openBookingModal } = useBooking();
  const { background_color, primary_color, text_color, text_button_color } =
    style;

  return (
    <section
      style={{ backgroundImage: `url('${banner_url}')` }}
      className="relative w-screen h-screen mt-[11vh] bg-cover bg-center bg-no-repeat"
    >
      <div className="sticky mx-auto top-[calc(100vh-100px)] left-0 px-6 pb-6 w-fit">
        <div className="relative w-fit mx-auto">
          <div
            style={{ backgroundColor: background_color }}
            className="absolute top-1.5 left-1.5 w-full h-full"
          />
          <button
            type="button"
            onClick={() => openBookingModal()}
            style={{
              backgroundColor: primary_color,
              color: text_button_color,
              borderColor: text_color,
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
