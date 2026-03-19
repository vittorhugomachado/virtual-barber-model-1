import { type ReactNode } from "react";
import { BarberContext } from "./barber-context";
import type { BarbershopData } from "../types/barbershop.types";

interface BarberProviderProps {
  data: BarbershopData;
  children: ReactNode;
}

export function BarberProvider({ data, children }: BarberProviderProps) {
  return (
    <BarberContext.Provider value={data}>
      {children}
    </BarberContext.Provider>
  );
}