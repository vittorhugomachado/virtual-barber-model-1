import { X } from "lucide-react";

export type CustomerAuthMode = "entrar" | "cadastrar";

type CustomerAuthSharedProps = {
  mode: CustomerAuthMode;
  isLoading: boolean;
  error: string | null;
  textColor: string;
  primaryColor: string;
  textButtonColor: string;
  onChangeMode: (mode: CustomerAuthMode) => void;
  onContinueWithGoogle: () => void;
};

export function CustomerAuthCard({
  mode,
  isLoading,
  error,
  textColor,
  primaryColor,
  textButtonColor,
  onChangeMode,
  onContinueWithGoogle,
}: CustomerAuthSharedProps) {
  return (
    <div
      style={{ borderColor: `${textColor}` }}
      className="mx-auto flex w-full max-w-125 flex-col items-center space-y-6 border px-6 py-8 text-center"
    >
      <div className="space-y-2">
        <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
          Autenticação
        </h3>
      </div>

      <div className="flex w-full max-w-[320px] items-center justify-center gap-2">
        {(["entrar", "cadastrar"] as const).map((item) => {
          const active = mode === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onChangeMode(item)}
              style={{
                backgroundColor: active ? primaryColor : "transparent",
                borderColor: active ? primaryColor : `${textColor}30`,
                color: active ? textButtonColor : textColor,
              }}
              className="flex-1 cursor-pointer border px-4 py-3 text-xs font-black uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-80"
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onContinueWithGoogle}
        disabled={isLoading}
        style={{ color: textColor, borderColor: `${textColor}40` }}
        className="flex cursor-pointer border w-full max-w-[320px] items-center justify-center gap-3 px-5 py-3 text-sm uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="h-5 w-5"
        >
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 5.1 29 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.2-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 5.1 29 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 43c5.2 0 9.9-2 13.5-5.3l-6.2-5.1C29.2 34.5 26.7 35 24 35c-5.3 0-9.7-3.6-11.3-8.5l-6.5 5C9.6 38.7 16.3 43 24 43z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.4 5.4-6.4 6.9l6.2 5.1C39.9 36.5 44 30.5 44 23c0-1.3-.1-2.2-.4-3.5z"
          />
        </svg>

        {isLoading
          ? "Conectando..."
          : mode === "entrar"
            ? "Entrar com Google"
            : "Cadastrar com Google"}
      </button>

      {error && (
        <p className="max-w-[320px] text-sm font-semibold tracking-[0.08em] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

type CustomerAuthModalProps = CustomerAuthSharedProps & {
  isOpen: boolean;
  backgroundColor: string;
  onClose: () => void;
};

export function CustomerAuthModal({
  isOpen,
  mode,
  isLoading,
  error,
  textColor,
  backgroundColor,
  primaryColor,
  textButtonColor,
  onClose,
  onChangeMode,
  onContinueWithGoogle,
}: CustomerAuthModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70"
      style={{ zIndex: 300 }}
      onClick={onClose}
    >
      <div className="relative mx-auto h-screen w-screen">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          style={{
            color: textColor,
            borderColor: textColor,
            backgroundColor,
          }}
          className="absolute right-6 top-4 z-10 cursor-pointer border px-4 py-3 text-sm font-black uppercase tracking-[0.2em]"
        >
          <X className="size-4" />
        </button>

        <div
          style={{ backgroundColor, color: textColor }}
          className="relative flex h-full w-full items-center justify-center overflow-hidden px-6"
          onClick={(event) => event.stopPropagation()}
        >
          <CustomerAuthCard
            mode={mode}
            isLoading={isLoading}
            error={error}
            textColor={textColor}
            primaryColor={primaryColor}
            textButtonColor={textButtonColor}
            onChangeMode={onChangeMode}
            onContinueWithGoogle={onContinueWithGoogle}
          />
        </div>
      </div>
    </div>
  );
}
