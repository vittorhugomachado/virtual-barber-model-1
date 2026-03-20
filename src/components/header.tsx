import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CustomerAuthModal,
  type CustomerAuthMode,
} from "./customer-auth-modal";
import { useBooking } from "../hooks/useBooking";
import { useBarbershop } from "../hooks/useBarbershop";
import { useCustomerAuth } from "../hooks/useCustomerAuth";

function getBreakpoint(name: string): number {
  const len = name.length;
  if (len <= 10) return 768;
  if (len <= 15) return 900;
  if (len <= 20) return 1000;
  if (len <= 25) return 1040;
  return 1124;
}

export function Header() {
  const { name, style } = useBarbershop();
  const { openBookingModal, openMyAppointmentsModal } = useBooking();
  const { profile, signInWithGoogle, signOut } = useCustomerAuth();
  const { text_color, background_color, primary_color, text_button_color } =
    style;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalMode, setAuthModalMode] =
    useState<CustomerAuthMode>("entrar");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const desktopUserMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement | null>(null);
  const bp = getBreakpoint(name);
  const closeMobileMenu = () => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  };

  const navItemClass = `
    cursor-pointer transition-opacity relative
    after:absolute after:bottom-0 after:left-0
    after:h-[2px] after:w-0 after:bg-current
    after:transition-all after:duration-300
    hover:after:w-full
  `;

  useEffect(() => {
    if (!userMenuOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedDesktopMenu = desktopUserMenuRef.current?.contains(target);
      const clickedMobileMenu = mobileUserMenuRef.current?.contains(target);

      if (clickedDesktopMenu || clickedMobileMenu) return;
      setUserMenuOpen(false);
    };

    window.addEventListener("mousedown", handleOutsideClick);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [userMenuOpen]);

  const openAuthModal = (mode: "entrar" | "cadastrar") => {
    setAuthError(null);
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
    setUserMenuOpen(false);
  };

  const handleGoogleAuth = async () => {
    try {
      setAuthError(null);
      setIsStartingOAuth(true);
      await signInWithGoogle(window.location.href);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel continuar com Google.",
      );
      setIsStartingOAuth(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Nao foi possivel sair.",
      );
      setIsAuthModalOpen(true);
      setUserMenuOpen(false);
    }
  };

  const handleOpenMyAppointments = () => {
    openMyAppointmentsModal();
    setUserMenuOpen(false);
  };

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
        className="fixed top-0 left-0 z-120 w-full overflow-visible px-4 text-md font-bold md:px-6 xl:text-lg"
      >
        <div className="flex min-h-[11vh] items-center justify-between">
          <h2
            style={{ color: text_color }}
            className="inline max-w-[60vw] px-2 text-center text-2xl font-black leading-tight wrap-break-word sm:max-w-[70vw]"
          >
            {name.toUpperCase()}
          </h2>

          <ul
            style={{ color: text_color }}
            className="nav-desktop items-center gap-6"
          >
            <li className={navItemClass}>
              <a href="#horarios" onClick={closeMobileMenu}>HORÁRIOS</a>
            </li>
            <li className={navItemClass}>
              <a href="#equipe" onClick={closeMobileMenu}>EQUIPE</a>
            </li>
            <li className={navItemClass}>
              <a href="#servicos" onClick={closeMobileMenu}>SERVIÇOS</a>
            </li>
            <li className={navItemClass}>
              <a href="#contato" onClick={closeMobileMenu}>CONTATO</a>
            </li>
            <li className="ml-2">
              <div className="relative">
                <div
                  style={{ backgroundColor: primary_color }}
                  className="absolute top-1 left-1 h-full w-full"
                />
                <button
                  type="button"
                  onClick={() => { closeMobileMenu(); openBookingModal(); }}
                  style={{
                    color: text_color,
                    borderColor: text_color,
                    backgroundColor: background_color,
                  }}
                  className="relative cursor-pointer border-2 px-4 py-2 transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  AGENDAR
                </button>
              </div>
            </li>
            <li className="ml-1">
              <div ref={desktopUserMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((current) => !current)}
                  style={{ color: text_color }}
                  className="cursor-pointer bg-transparent p-1"
                  aria-label="Abrir menu do cliente"
                >
                  <User className="size-6" />
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      backgroundColor: background_color,
                      borderColor: `${text_color}30`,
                      color: text_color,
                    }}
                    className="absolute right-0 top-full z-130 mt-3 min-w-44 border p-2 shadow-2xl"
                  >
                    {profile ? (
                      <div className="space-y-1">
                        <div className="border-b border-current/20 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] opacity-80">
                          {profile.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => { closeMobileMenu(); handleOpenMyAppointments(); }}
                          className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                        >
                          <User className="size-4" />
                          Meu agendamentos
                        </button>
                        <button
                          type="button"
                          onClick={async () => { closeMobileMenu(); await handleSignOut(); }}
                          className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                        >
                          <LogOut className="size-4" />
                          Sair
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => openAuthModal("entrar")}
                          className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                        >
                          <LogIn className="size-4" />
                          Entrar
                        </button>
                        <button
                          type="button"
                          onClick={() => openAuthModal("cadastrar")}
                          className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                        >
                          <UserPlus className="size-4" />
                          Se cadastrar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          </ul>

          <button
            style={{ color: text_color }}
            className="hamburger z-150 flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
          >
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-current transition-all duration-300 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>

        <div
          className={`mobile-menu-wrapper fixed inset-0 z-140 transition-opacity duration-300 ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeMobileMenu}
          />

          <div
            style={{
              backgroundColor: background_color,
              color: text_color,
              borderColor: `${text_color}20`,
            }}
            className={`absolute left-0 top-0 flex h-screen w-[calc(100%-50px)] max-w-[280px] flex-col overflow-y-auto border-r px-6 pb-8 pt-6 shadow-2xl transition-transform duration-300 ${
              menuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <h2
              style={{ color: text_color }}
              className="mb-4 text-2xl font-black leading-tight wrap-break-word"
            >
              {name.toUpperCase()}
            </h2>

            <ul className="flex w-full flex-col gap-4">
              <li className={navItemClass}>
                <a href="#horarios" onClick={closeMobileMenu}>HORÁRIOS</a>
              </li>
              <li className={navItemClass}>
                <a href="#equipe" onClick={closeMobileMenu}>EQUIPE</a>
              </li>
              <li className={navItemClass}>
                <a href="#servicos" onClick={closeMobileMenu}>SERVIÇOS</a>
              </li>
              <li className={navItemClass}>
                <a href="#contato" onClick={closeMobileMenu}>CONTATO</a>
              </li>
              <li className="mt-2 w-full max-w-36">
                <div className="relative w-full">
                  <div
                    style={{ backgroundColor: primary_color }}
                    className="absolute top-1.5 left-1.5 h-full w-full"
                  />
                  <button
                    type="button"
                    onClick={() => { closeMobileMenu(); openBookingModal(); }}
                    style={{
                      color: text_color,
                      borderColor: text_color,
                      backgroundColor: background_color,
                    }}
                    className="relative w-full cursor-pointer border-2 px-4 py-2 text-center transition-all duration-200 hover:translate-x-1"
                  >
                    AGENDAR
                  </button>
                </div>
              </li>
              <li className="mt-2">
                <div
                  ref={mobileUserMenuRef}
                  className="relative w-full max-w-52"
                >
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((current) => !current)}
                    style={{ color: text_color }}
                    className="flex cursor-pointer items-center gap-3 bg-transparent p-0 text-left"
                    aria-label="Abrir menu do cliente"
                  >
                    <User className="size-6" />
                    <span className="text-sm font-bold uppercase tracking-[0.15em]">
                      Cliente
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div
                      style={{
                        backgroundColor: background_color,
                        borderColor: `${text_color}30`,
                        color: text_color,
                      }}
                      className="mt-3 border p-3"
                    >
                      {profile ? (
                        <div className="space-y-1">
                          <div className="border-b border-current/20 px-2 py-2 text-xs font-black uppercase tracking-[0.12em] opacity-80">
                            {profile.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => { closeMobileMenu(); handleOpenMyAppointments(); }}
                            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                          >
                            <User className="size-4" />
                            Meu agendamentos
                          </button>
                          <button
                            type="button"
                            onClick={async () => { closeMobileMenu(); await handleSignOut(); }}
                            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                          >
                            <LogOut className="size-4" />
                            Sair
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => openAuthModal("entrar")}
                            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                          >
                            <LogIn className="size-4" />
                            Entrar
                          </button>
                          <button
                            type="button"
                            onClick={() => openAuthModal("cadastrar")}
                            className="flex w-full cursor-pointer items-center gap-3 px-2 py-2 text-left text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-75"
                          >
                            <UserPlus className="size-4" />
                            Se cadastrar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <CustomerAuthModal
          isOpen={isAuthModalOpen}
          mode={authModalMode}
          isLoading={isStartingOAuth}
          error={authError}
          textColor={text_color}
          backgroundColor={background_color}
          primaryColor={primary_color}
          textButtonColor={text_button_color}
          onClose={() => {
            setIsAuthModalOpen(false);
            setIsStartingOAuth(false);
          }}
          onChangeMode={(mode) => {
            setAuthError(null);
            setAuthModalMode(mode);
          }}
          onContinueWithGoogle={handleGoogleAuth}
        />
      </header>
    </>
  );
}

