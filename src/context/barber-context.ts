import { createContext } from "react";
import type { BarbershopData } from "../types/barbershop.types";

// Exportando apenas o contexto (não é um componente)
export const BarberContext = createContext<BarbershopData | null>(null);