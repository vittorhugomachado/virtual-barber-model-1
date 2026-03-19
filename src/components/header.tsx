import { useState } from "react";
import { useBarbershop } from "../hooks/useBarbershop";

function getBreakpoint(name: string): number {
  const len = name.length;
  if (len <= 10) return 768;
  if (len <= 15) return 900;
  if (len <= 20) return 1000;
  if (len <= 25) return 1040;
  return 1124;
}

export function Header() {
  const { name, description, style } = useBarbershop();
  const { text_color, background_color, primary_color } = style;
  const [menuOpen, setMenuOpen] = useState(false);
  const baseBp = getBreakpoint(name);
  const bp =
    description && description.trim().length > 0 ? baseBp + 50 : baseBp;

  const navItemClass = `
    cursor-pointer transition-opacity relative
    after:absolute after:bottom-0 after:left-0
    after:h-[2px] after:w-0 after:bg-current
    after:transition-all after:duration-300
    hover:after:w-full
  `;

  return (
    <>
      <style>{`
        .nav-desktop { display: none; }
        .hamburger { display: flex; }
        .mobile-menu-wrapper { display: block; }

        @media (min-width: ${bp}px) {
          .nav-desktop { display: flex; }
          .hamburger { display: none; }
          .mobile-menu-wrapper { display: none; }
        }
      `}</style>

      <header
        style={{ backgroundColor: background_color }}
        className="w-full text-md xl:text-lg font-bold px-4 md:px-6 fixed top-0 left-0 z-50 overflow-x-hidden"
      >
        <div className="flex items-center justify-between min-h-[11vh]">
          {/* NOME COM QUEBRA DE LINHA - modificado aqui */}
          <h2
            style={{ color: text_color }}
            className="text-center text-3xl xl:text-4xl inline px-2 wrap-break-word max-w-[60vw] sm:max-w-[70vw] leading-tight"
          >
            {name.toUpperCase()}
          </h2>

          <ul
            style={{ color: text_color }}
            className="nav-desktop gap-6 items-center mr-4"
          >
            {description && (
              <li className={navItemClass}>
                <a href="#sobre">SOBRE</a>
              </li>
            )}
            <li className={navItemClass}>
              <a href="#servicos">SERVIÇOS</a>
            </li>
            <li className={navItemClass}>
              <a href="#equipe">EQUIPE</a>
            </li>
            <li className={navItemClass}>
              <a href="#contato">CONTATO</a>
            </li>
            <li className="ml-2">
              <div className="relative">
                <div
                  style={{ backgroundColor: primary_color }}
                  className="absolute top-1 left-1 w-full h-full"
                />
                <div
                  style={{
                    color: text_color,
                    borderColor: text_color,
                    backgroundColor: background_color,
                  }}
                  className="relative px-4 py-2 cursor-pointer border-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200"
                >
                  AGENDAR
                </div>
              </div>
            </li>
          </ul>

          <button
            style={{ color: text_color }}
            className="hamburger flex-col gap-1.5 p-2 mr-4"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>

        {/* MENU MOBILE */}
        <div
          className={`mobile-menu-wrapper overflow-hidden transition-all duration-300 w-full ${
            menuOpen ? "max-h-105 pb-4" : "max-h-0"
          }`}
        >
          <div className="max-w-full overflow-x-hidden px-2">
            <ul
              style={{ color: text_color, height: menuOpen ? "180px" : "" }}
              className="flex flex-col gap-4 pl-2 w-full"
            >
              {description && (
                <li className={navItemClass}>
                  <a href="#sobre">SOBRE</a>
                </li>
              )}
              <li className={navItemClass}>
                <a href="#servicos">SERVIÇOS</a>
              </li>
              <li className={navItemClass}>
                <a href="#equipe">EQUIPE</a>
              </li>
              <li className={navItemClass}>
                <a href="#contato">CONTATO</a>
              </li>
              <li className="mt-2 w-full max-w-36">
                <div className="relative w-full">
                  <div
                    style={{ backgroundColor: primary_color }}
                    className="absolute top-1.5 left-1.5 w-full h-full"
                  />
                  <div
                    style={{
                      color: text_color,
                      borderColor: text_color,
                      backgroundColor: background_color,
                    }}
                    className="relative w-full px-4 py-2 cursor-pointer border-2 text-center hover:translate-x-1 transition-all duration-200"
                  >
                    AGENDAR
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
}