import { Scissors } from "lucide-react";
type LoadingComponentProps = {
  tailwindClass?: string;
  backgroundColor: string;
  color: string;
  text: string;
};

export function LoadingComponent({
  tailwindClass,
  backgroundColor,
  color,
  text
}: LoadingComponentProps) {
  return (
    <div
      style={{ color, backgroundColor }}
      className={`${tailwindClass} bg-zinc-950 text-white flex h-full w-full items-center justify-center px-6 py-12`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Tesoura */}
        <Scissors className="h-10 w-10 animate-pulse" />

        {/* Texto */}
        <p id="loading-text" className="text-sm animate-pulse uppercase">
          {text}
        </p>
      </div>
    </div>
  );
}
