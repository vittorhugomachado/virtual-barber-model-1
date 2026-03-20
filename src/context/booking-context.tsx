import { createContext } from "react";

export interface BookingContextValue {
  isOpen: boolean;
  initialServiceIds: string[];
  openBookingModal: (serviceIds?: string[]) => void;
  closeBookingModal: () => void;
  openMyAppointmentsModal: () => void;
  closeMyAppointmentsModal: () => void;
}

export const BookingContext = createContext<BookingContextValue | null>(null);
