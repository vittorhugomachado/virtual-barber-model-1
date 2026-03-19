import { useContext } from "react";
import { BarberContext } from "../context/barber-context";
import type { BarbershopData } from "../types/barbershop.types";

export function useBarbershop(): BarbershopData {
  const ctx = useContext(BarberContext);
  if (!ctx) {
    throw new Error("useBarbershop must be used inside BarberProvider");
  }
  return ctx;
}