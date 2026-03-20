import { Clock3 } from "lucide-react";
import { useBarbershop } from "../hooks/useBarbershop";

const WEEK_DAYS = [
  "Domingo",
  "Segunda",
  "Terca",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sabado",
] as const;

function formatHour(value: string) {
  return value.slice(0, 5);
}

export function HoursSection() {
  const { openingHours, style } = useBarbershop();
  const { background_color, primary_color, text_color } = style;

  const scheduleByDay = WEEK_DAYS.map((label, dayIndex) => {
    const periods = openingHours
      .filter((item) => item.day_of_week === dayIndex && item.is_open)
      .sort((a, b) => a.period_order - b.period_order);

    return {
      label,
      periods,
      isClosed: periods.length === 0,
    };
  });

  return (
    <section
      id="horarios"
      style={{ backgroundColor: background_color, color: text_color }}
      className="scroll-mt-[11vh] w-full px-6 md:px-10 lg:px-16 py-16 md:py-24"
    >
      <div className="max-w-350 mx-auto">
        <div className="mb-10 md:mb-14 flex justify-center">
          <h2
            style={{ borderColor: primary_color }}
            className="inline text-[40px] px-8 sm:text-[52px] font-black uppercase leading-none tracking-tight border-b-4"
          >
            HORÁRIOS
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
            {scheduleByDay.map((day) => (
              <div
                key={day.label}
                style={{borderColor: `${text_color}30`}}
                className="flex flex-col border mb-2 gap-3 px-5 py-4 md:flex-row items-center md:justify-between"
              >
                <div className="flex items-center justify-center gap-3">
                  <Clock3 style={{ color: primary_color }} className="size-5 shrink-0" />
                  <span className="text-lg font-bold uppercase tracking-wide">
                    {day.label}
                  </span>
                </div>

                <div className="flex justify-center flex-wrap gap-2 md:justify-end">
                  {day.isClosed ? (
                    <span
                      style={{ borderColor: text_color, color: text_color }}
                      className="border px-3 py-1 text-sm font-semibold uppercase tracking-wider opacity-70"
                    >
                      Fechado
                    </span>
                  ) : (
                    day.periods.map((period) => (
                      <span
                        key={period.id}
                        style={{ backgroundColor: text_color, color: background_color }}
                        className="px-3 py-1 text-sm font-bold uppercase tracking-wider"
                      >
                        {formatHour(period.opens_at)} - {formatHour(period.closes_at)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
}
