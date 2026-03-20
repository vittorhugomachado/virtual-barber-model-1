import { supabase } from "../lib/supabase";
import type { Barber, OpeningHour, Service } from "../types/barbershop.types";

export interface BarberAvailability {
  id: string;
  barber_id: string;
  day_of_week: number;
  is_day_off: boolean;
  use_custom_hours: boolean;
  starts_at: string | null;
  ends_at: string | null;
  period_order: number;
}

export interface AppointmentRecord {
  id: string;
  barber_id: string | null;
  starts_at: string;
  ends_at: string;
  status: string | null;
}

export interface CustomerAppointmentRecord {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string | null;
  service: {
    name: string | null;
    price: number | null;
  } | null;
  barber: {
    name: string | null;
  } | null;
}

type CustomerAppointmentRow = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string | null;
  service:
    | {
        name: string | null;
        price: number | null;
      }
    | {
        name: string | null;
        price: number | null;
      }[]
    | null;
  barber:
    | {
        name: string | null;
      }
    | {
        name: string | null;
      }[]
    | null;
};

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
}

export interface CreateAppointmentInput {
  barbershop_id: string;
  customer_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
}

export interface TimePeriod {
  startMinutes: number;
  endMinutes: number;
}

export interface BarberSlot {
  startsAt: string;
  endsAt: string;
  label: string;
  startMinutes: number;
  endMinutes: number;
  isAvailable: boolean;
}

const SLOT_INTERVAL_MINUTES = 30;

function getDateObject(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(getDateObject(date));
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: string, amount: number) {
  const value = getDateObject(date);
  value.setDate(value.getDate() + amount);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildAppointmentDateTime(date: string, time: string) {
  return `${date}T${time}:00+00:00`;
}

function formatPersistedClockTime(date: string, time: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(buildAppointmentDateTime(date, time)));
}

export function formatPersistedAppointmentRange(
  date: string,
  startsAt: string,
  endsAt: string,
) {
  return `${formatPersistedClockTime(date, startsAt)} - ${formatPersistedClockTime(
    date,
    endsAt,
  )}`;
}

function getDayOfWeek(date: string) {
  return getDateObject(date).getDay();
}

function timeToMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function minutesToTime(value: number) {
  const hours = `${Math.floor(value / 60)}`.padStart(2, "0");
  const minutes = `${value % 60}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function intersectPeriods(source: TimePeriod[], target: TimePeriod[]) {
  const intersections: TimePeriod[] = [];

  for (const left of source) {
    for (const right of target) {
      const startMinutes = Math.max(left.startMinutes, right.startMinutes);
      const endMinutes = Math.min(left.endMinutes, right.endMinutes);

      if (startMinutes < endMinutes) {
        intersections.push({ startMinutes, endMinutes });
      }
    }
  }

  return intersections.sort((a, b) => a.startMinutes - b.startMinutes);
}

function getSingleJoinedRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isCanceledStatus(status: string | null) {
  if (!status) return false;
  return status.toLowerCase().includes("cancel");
}

export function isDateOpen(openingHours: OpeningHour[], date: string) {
  const dayOfWeek = getDayOfWeek(date);
  return openingHours.some((item) => item.day_of_week === dayOfWeek && item.is_open);
}

export function findNextOpenDate(openingHours: OpeningHour[], startDate: string) {
  for (let offset = 0; offset < 365; offset += 1) {
    const date = addDays(startDate, offset);
    if (isDateOpen(openingHours, date)) {
      return date;
    }
  }

  return startDate;
}

export function findAdjacentOpenDate(
  openingHours: OpeningHour[],
  startDate: string,
  direction: 1 | -1,
) {
  const today = getTodayDateString();

  for (let offset = 1; offset < 365; offset += 1) {
    const date = addDays(startDate, offset * direction);

    if (direction < 0 && date < today) {
      break;
    }

    if (isDateOpen(openingHours, date)) {
      return date;
    }
  }

  return startDate;
}

export function getCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const firstVisibleDay = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const value = new Date(firstVisibleDay);
    value.setDate(firstVisibleDay.getDate() + index);
    const iso = `${value.getFullYear()}-${`${value.getMonth() + 1}`.padStart(2, "0")}-${`${value.getDate()}`.padStart(2, "0")}`;

    return {
      iso,
      day: value.getDate(),
      isCurrentMonth: value.getMonth() === month,
    };
  });
}

export async function fetchBarberAvailability(barbershopId: string) {
  const { data, error } = await supabase
    .from("barber_availability")
    .select(
      "id, barber_id, day_of_week, is_day_off, use_custom_hours, starts_at, ends_at, period_order",
    )
    .eq("barbershop_id", barbershopId)
    .order("day_of_week", { ascending: true })
    .order("period_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []) as BarberAvailability[];
}

export async function fetchAppointmentsForDate(barbershopId: string, date: string) {
  const nextDate = addDays(date, 1);
  const { data, error } = await supabase
    .from("appointments")
    .select("id, barber_id, starts_at, ends_at, status")
    .eq("barbershop_id", barbershopId)
    .gte("starts_at", `${date}T00:00:00`)
    .lt("starts_at", `${nextDate}T00:00:00`);

  if (error) throw new Error(error.message);

  return (data ?? []) as AppointmentRecord[];
}

export async function fetchCustomerAppointments({
  barbershopId,
  customerId,
}: {
  barbershopId: string;
  customerId: string;
}): Promise<CustomerAppointmentRecord[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, service:services(name, price), barber:barbers(name)",
    )
    .eq("barbershop_id", barbershopId)
    .eq("customer_id", customerId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as CustomerAppointmentRow[]).map((item) => {
    const service = getSingleJoinedRelation(item.service);
    const barber = getSingleJoinedRelation(item.barber);

    return {
      id: item.id,
      starts_at: item.starts_at,
      ends_at: item.ends_at,
      status: item.status,
      service: service
        ? {
            name: service.name,
            price: service.price,
          }
        : null,
      barber: barber
        ? {
            name: barber.name,
          }
        : null,
    };
  });
}

export async function cancelCustomerAppointment({
  appointmentId,
  customerId,
}: {
  appointmentId: string;
  customerId: string;
}) {
  const { error } = await supabase
    .from("appointments")
    .update({
      status: "cancelled_by_customer",
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("customer_id", customerId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getOrCreateCustomer({
  barbershopId,
  name,
  phone,
}: {
  barbershopId: string;
  name: string;
  phone: string;
}) {
  const normalizedPhone = phone.replace(/\D/g, "");

  const { data: existingCustomer, error: existingCustomerError } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("barbershop_id", barbershopId)
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (existingCustomerError) {
    throw new Error(existingCustomerError.message);
  }

  if (existingCustomer) {
    if (existingCustomer.name !== name) {
      const { error: updateCustomerError } = await supabase
        .from("customers")
        .update({
          name,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      if (updateCustomerError) {
        throw new Error(updateCustomerError.message);
      }
    }

    return existingCustomer as CustomerRecord;
  }

  const { data: createdCustomer, error: createCustomerError } = await supabase
    .from("customers")
    .insert({
      barbershop_id: barbershopId,
      name,
      phone: normalizedPhone,
    })
    .select("id, name, phone")
    .single();

  if (createCustomerError) {
    throw new Error(createCustomerError.message);
  }

  return createdCustomer as CustomerRecord;
}

export async function createAppointments(appointments: CreateAppointmentInput[]) {
  for (const appointment of appointments) {
    const { error } = await supabase.from("appointments").insert(appointment);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export function getSelectedDuration(selectedServices: Service[]) {
  return selectedServices.reduce(
    (total, service) => total + (service.duration_min ?? 0),
    0,
  );
}

export function getWorkingPeriodsForBarber({
  barberId,
  date,
  openingHours,
  availability,
}: {
  barberId: string;
  date: string;
  openingHours: OpeningHour[];
  availability: BarberAvailability[];
}) {
  const dayOfWeek = getDayOfWeek(date);
  const openingPeriods = openingHours
    .filter((item) => item.day_of_week === dayOfWeek && item.is_open)
    .map((item) => ({
      startMinutes: timeToMinutes(item.opens_at),
      endMinutes: timeToMinutes(item.closes_at),
    }));

  const barberEntries = availability.filter(
    (item) => item.barber_id === barberId && item.day_of_week === dayOfWeek,
  );

  if (openingPeriods.length === 0) return [];
  if (barberEntries.some((item) => item.is_day_off)) return [];

  const customPeriods = barberEntries
    .filter((item) => item.use_custom_hours && item.starts_at && item.ends_at)
    .map((item) => ({
      startMinutes: timeToMinutes(item.starts_at as string),
      endMinutes: timeToMinutes(item.ends_at as string),
    }));

  if (customPeriods.length === 0) {
    return openingPeriods;
  }

  return intersectPeriods(openingPeriods, customPeriods);
}

export function barberCanPerformServices(barber: Barber, selectedServices: Service[]) {
  if (selectedServices.length === 0) return true;
  if (barber.serviceIds.length === 0) return true;
  return selectedServices.every((service) => barber.serviceIds.includes(service.id));
}

export function getSlotsForBarber({
  barberId,
  date,
  openingHours,
  availability,
  appointments,
  durationMinutes,
  blockedPeriods = [],
}: {
  barberId: string;
  date: string;
  openingHours: OpeningHour[];
  availability: BarberAvailability[];
  appointments: AppointmentRecord[];
  durationMinutes: number;
  blockedPeriods?: TimePeriod[];
}) {
  if (durationMinutes <= 0) return [];

  const periods = getWorkingPeriodsForBarber({
    barberId,
    date,
    openingHours,
    availability,
  });

  const occupiedPeriods = appointments
    .filter((item) => item.barber_id === barberId && !isCanceledStatus(item.status))
    .map((item) => {
      const start = new Date(item.starts_at);
      const end = new Date(item.ends_at);

      return {
        startMinutes: start.getUTCHours() * 60 + start.getUTCMinutes(),
        endMinutes: end.getUTCHours() * 60 + end.getUTCMinutes(),
      };
    });

  const unavailablePeriods = [...occupiedPeriods, ...blockedPeriods];

  const slots: BarberSlot[] = [];

  for (const period of periods) {
    for (
      let current = period.startMinutes;
      current + durationMinutes <= period.endMinutes;
      current += SLOT_INTERVAL_MINUTES
    ) {
      const endMinutes = current + durationMinutes;
      const overlaps = unavailablePeriods.some(
        (item) => current < item.endMinutes && endMinutes > item.startMinutes,
      );

      slots.push({
        startsAt: minutesToTime(current),
        endsAt: minutesToTime(endMinutes),
        label: minutesToTime(current),
        startMinutes: current,
        endMinutes,
        isAvailable: !overlaps,
      });
    }
  }

  return slots;
}
