import { Scissors } from "lucide-react";

export function LoadingComponent() {
  return (
    <div className="bg-zinc-950 text-white flex min-h-screen w-full items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center gap-4">
        {/* Tesoura */}
        <Scissors className="h-10 w-10 animate-pulse" />

        {/* Texto */}
        <p id="loading-text" className="text-sm animate-pulse">
          CARREGANDO
        </p>
      </div>
    </div>
  );
}
