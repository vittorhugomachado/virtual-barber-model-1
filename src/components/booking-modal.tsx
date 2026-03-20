import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock3,
  Scissors,
  X,
  User,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BookingContext } from "../context/booking-context";
import { useBarbershop } from "../hooks/useBarbershop";
import { useBooking } from "../hooks/useBooking";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import { CustomerAuthCard, type CustomerAuthMode } from "./customer-auth-modal";
import { MyAppointmentsModal } from "./my-appointments-modal";
import {
  addDays,
  barberCanPerformServices,
  buildAppointmentDateTime,
  createAppointments,
  fetchAppointmentsForDate,
  fetchBarberAvailability,
  findNextOpenDate,
  formatDateLabel,
  formatMonthLabel,
  getCalendarDays,
  getSelectedDuration,
  getSlotsForBarber,
  getTodayDateString,
  isDateOpen,
  type AppointmentRecord,
  type BarberAvailability,
  type BarberSlot,
  type CreateAppointmentInput,
} from "../services/booking.service";
import {
  findCustomerByAuthUser,
  getOrCreateCustomerFromAuth,
} from "../services/customer-auth.service";
import { LoadingComponent } from "./loading-component";

type BookingStep = 1 | 2 | 3 | 4;
type ServiceSelection = {
  serviceId: string;
  barberId: string | null;
  slot: BarberSlot | null;
};
type CompletedServiceSelection = {
  serviceId: string;
  barberId: string;
  slot: BarberSlot;
};
type BookingResumePayload = {
  serviceIds: string[];
  selectedDate: string | null;
  serviceSelections: ServiceSelection[];
  step: BookingStep;
};

const STEP_LABELS = [
  "Servicos",
  "Data",
  "Profissional",
  "Confirmacao",
] as const;
const BOOKING_OAUTH_RESUME_KEY = "booking_oauth_resume";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getMonthStart(date: string) {
  const value = new Date(`${date}T12:00:00`);
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function formatWeekdayLabel(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function getDisplayedMinutesFromSlotLabel(label: string) {
  const [hours = "0", minutes = "0"] = label.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function getSlotPeriodGroups(slots: BarberSlot[]) {
  const groups = [
    {
      key: "manha",
      label: "Manha",
      slots: [] as BarberSlot[],
    },
    {
      key: "tarde",
      label: "Tarde",
      slots: [] as BarberSlot[],
    },
    {
      key: "noite",
      label: "Noite",
      slots: [] as BarberSlot[],
    },
  ];

  slots.forEach((slot) => {
    const minutes = getDisplayedMinutesFromSlotLabel(slot.label);

    if (minutes >= 241 && minutes <= 780) {
      groups[0].slots.push(slot);
      return;
    }

    if (minutes >= 781 && minutes <= 1140) {
      groups[1].slots.push(slot);
      return;
    }

    groups[2].slots.push(slot);
  });

  return groups.filter((group) => group.slots.length > 0);
}

function SummaryMetaItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`text-xs uppercase ${className}`.trim()}>{children}</p>;
}

function hasAppointmentConflict(
  appointments: CreateAppointmentInput[],
): boolean {
  for (let index = 0; index < appointments.length; index += 1) {
    const current = appointments[index];
    const currentStartsAt = new Date(current.starts_at).getTime();
    const currentEndsAt = new Date(current.ends_at).getTime();

    for (
      let innerIndex = index + 1;
      innerIndex < appointments.length;
      innerIndex += 1
    ) {
      const next = appointments[innerIndex];
      const nextStartsAt = new Date(next.starts_at).getTime();
      const nextEndsAt = new Date(next.ends_at).getTime();

      if (currentStartsAt < nextEndsAt && currentEndsAt > nextStartsAt) {
        return true;
      }
    }
  }

  return false;
}

function buildInitialServiceSelections(
  serviceIds: string[],
): ServiceSelection[] {
  return serviceIds.map((serviceId) => ({
    serviceId,
    barberId: null,
    slot: null,
  }));
}

function getBookingResumePayload() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.sessionStorage.getItem(BOOKING_OAUTH_RESUME_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(
      storedValue,
    ) as Partial<BookingResumePayload>;

    return {
      serviceIds: Array.isArray(parsedValue.serviceIds)
        ? parsedValue.serviceIds
        : [],
      selectedDate:
        typeof parsedValue.selectedDate === "string"
          ? parsedValue.selectedDate
          : null,
      serviceSelections: Array.isArray(parsedValue.serviceSelections)
        ? parsedValue.serviceSelections
        : [],
      step:
        parsedValue.step === 1 ||
        parsedValue.step === 2 ||
        parsedValue.step === 3 ||
        parsedValue.step === 4
          ? parsedValue.step
          : 4,
    } satisfies BookingResumePayload;
  } catch {
    return null;
  }
}

function BarberCardImage({
  name,
  avatarUrl,
  textColor,
}: {
  name: string;
  avatarUrl?: string | null;
  textColor: string;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-full object-cover lg:h-auto lg:shrink-0"
      />
    );
  }

  return (
    <div
      style={{ backgroundColor: `${textColor}12`, color: textColor }}
      className="flex h-full w-20 items-center justify-center lg:shrink-0"
    >
      <User className="size-10 opacity-50" />
    </div>
  );
}

function getServiceSelectionProgress({
  durationMinutes,
  price,
  barberId,
  slot,
}: {
  durationMinutes: number | null | undefined;
  price: number | null | undefined;
  barberId: string | null | undefined;
  slot: BarberSlot | null | undefined;
}) {
  return [durationMinutes != null, price != null, !!barberId, !!slot].filter(
    Boolean,
  ).length;
}

function StepTag({
  active,
  done,
  disabled,
  label,
  primaryColor,
  textColor,
  textButtonColor,
  onClick,
}: {
  active: boolean;
  done: boolean;
  disabled: boolean;
  label: string;
  primaryColor: string;
  textColor: string;
  textButtonColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderColor: active ? primaryColor : `${textColor}30`,
        backgroundColor: active
          ? primaryColor
          : done
            ? `${textColor}12`
            : "transparent",
        color: active ? textButtonColor : textColor,
        opacity: disabled ? 0.45 : 1,
      }}
      className="cursor-pointer border px-4 py-2 text-xs font-black uppercase tracking-[0.25em] disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

interface BookingProviderProps {
  children: ReactNode;
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [resumeState] = useState(() => getBookingResumePayload());
  const [isOpen, setIsOpen] = useState(!!resumeState);
  const [isMyAppointmentsOpen, setIsMyAppointmentsOpen] = useState(false);
  const [initialServiceIds, setInitialServiceIds] = useState<string[]>(
    resumeState?.serviceIds ?? [],
  );
  const [initialDate, setInitialDate] = useState<string | null>(
    resumeState?.selectedDate ?? null,
  );
  const [initialStep, setInitialStep] = useState<BookingStep>(
    resumeState?.step ?? 1,
  );
  const [initialSelections, setInitialSelections] = useState<
    ServiceSelection[]
  >(resumeState?.serviceSelections ?? []);
  const [sessionKey, setSessionKey] = useState(resumeState ? 1 : 0);

  useEffect(() => {
    if (!resumeState || typeof window === "undefined") return;

    window.sessionStorage.removeItem(BOOKING_OAUTH_RESUME_KEY);
  }, [resumeState]);

  const openBookingModal = (serviceIds: string[] = []) => {
    setInitialServiceIds(serviceIds);
    setInitialDate(null);
    setInitialStep(1);
    setInitialSelections(buildInitialServiceSelections(serviceIds));
    setSessionKey((current) => current + 1);
    setIsOpen(true);
  };

  const closeBookingModal = () => {
    setIsOpen(false);
  };

  const openMyAppointmentsModal = () => {
    setIsMyAppointmentsOpen(true);
  };

  const closeMyAppointmentsModal = () => {
    setIsMyAppointmentsOpen(false);
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        initialServiceIds,
        openBookingModal,
        closeBookingModal,
        openMyAppointmentsModal,
        closeMyAppointmentsModal,
      }}
    >
      {children}
      <BookingModal
        key={sessionKey}
        isOpen={isOpen}
        initialServiceIds={initialServiceIds}
        initialDate={initialDate}
        initialStep={initialStep}
        initialSelections={initialSelections}
        onClose={closeBookingModal}
      />
      <MyAppointmentsModal
        key={isMyAppointmentsOpen ? "open" : "closed"}
        isOpen={isMyAppointmentsOpen}
        onClose={closeMyAppointmentsModal}
      />
    </BookingContext.Provider>
  );
}

function BookingModal({
  isOpen,
  initialServiceIds,
  initialDate,
  initialStep,
  initialSelections,
  onClose,
}: {
  isOpen: boolean;
  initialServiceIds: string[];
  initialDate: string | null;
  initialStep: BookingStep;
  initialSelections: ServiceSelection[];
  onClose: () => void;
}) {
  const { id, services, barbers, openingHours, style } = useBarbershop();
  const { isLoading, profile, signInWithGoogle } = useCustomerAuth();
  const { openMyAppointmentsModal } = useBooking();
  const { background_color, primary_color, text_color, text_button_color } =
    style;
  const today = getTodayDateString();
  const initialOpenDate = findNextOpenDate(openingHours, today);
  const [step, setStep] = useState<BookingStep>(initialStep);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] =
    useState(initialServiceIds);
  const [selectedDate, setSelectedDate] = useState(
    initialDate ?? initialOpenDate,
  );
  const [calendarMonth, setCalendarMonth] = useState(
    getMonthStart(initialDate ?? initialOpenDate),
  );
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    initialServiceIds[0] ?? null,
  );
  const [serviceSelections, setServiceSelections] = useState<
    ServiceSelection[]
  >(
    initialSelections.length > 0
      ? initialSelections
      : buildInitialServiceSelections(initialServiceIds),
  );
  const [availability, setAvailability] = useState<BarberAvailability[] | null>(
    null,
  );
  const [appointments, setAppointments] = useState<AppointmentRecord[] | null>(
    null,
  );
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isStartingOAuth, setIsStartingOAuth] = useState(false);
  const [customerAuthMode, setCustomerAuthMode] =
    useState<CustomerAuthMode>("entrar");
  const serviceCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [selectedServiceIds, services],
  );

  const selectedServicesWithSelections = useMemo(
    () =>
      selectedServices.map((service) => ({
        service,
        selection:
          serviceSelections.find((item) => item.serviceId === service.id) ??
          null,
      })),
    [selectedServices, serviceSelections],
  );

  const scheduledSelections = useMemo(
    () =>
      selectedServicesWithSelections
        .map(({ service, selection }) => {
          if (!selection?.barberId || !selection.slot) {
            return null;
          }

          const barber = barbers.find((item) => item.id === selection.barberId);

          return {
            service,
            barber,
            selection: selection as CompletedServiceSelection,
          };
        })
        .filter(
          (
            item,
          ): item is {
            service: (typeof selectedServicesWithSelections)[number]["service"];
            barber: (typeof barbers)[number] | undefined;
            selection: CompletedServiceSelection;
          } => item !== null,
        )
        .sort(
          (left, right) =>
            left.selection.slot.startMinutes -
            right.selection.slot.startMinutes,
        ),
    [barbers, selectedServicesWithSelections],
  );

  const totalSelectedPrice = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + Number(service.price ?? 0),
        0,
      ),
    [selectedServices],
  );

  const availableBarbersByService = useMemo(() => {
    return selectedServices.map((service) => ({
      service,
      entries: barbers
        .filter(
          (barber) =>
            barber.is_active && barberCanPerformServices(barber, [service]),
        )
        .map((barber) => ({
          barber,
          slots: getSlotsForBarber({
            barberId: barber.id,
            date: selectedDate,
            openingHours,
            availability: availability ?? [],
            appointments: appointments ?? [],
            durationMinutes: getSelectedDuration([service]),
            blockedPeriods: serviceSelections
              .filter(
                (
                  item,
                ): item is typeof item & {
                  slot: NonNullable<typeof item.slot>;
                } => item.serviceId !== service.id && !!item.slot,
              )
              .map((item) => ({
                startMinutes: item.slot.startMinutes,
                endMinutes: item.slot.endMinutes,
              })),
          }),
        }))
        .filter((entry) => entry.slots.length > 0),
    }));
  }, [
    appointments,
    availability,
    barbers,
    openingHours,
    selectedDate,
    selectedServices,
    serviceSelections,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    fetchBarberAvailability(id)
      .then((result) => {
        if (cancelled) return;
        setAvailability(result);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setAvailabilityError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isOpen]);

  useEffect(() => {
    if (!isOpen || step < 3) return;

    let cancelled = false;

    fetchAppointmentsForDate(id, selectedDate)
      .then((result) => {
        if (cancelled) return;
        setAppointments(result);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setAppointmentsError(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isOpen, selectedDate, step]);

  useEffect(() => {
    if (!isOpen || !profile) return;

    if (!customerName.trim()) {
      setCustomerName(profile.name);
    }
  }, [customerName, isOpen, profile]);

  useEffect(() => {
    if (!isOpen || !profile) return;

    let cancelled = false;
    setAuthError(null);

    findCustomerByAuthUser({
      barbershopId: id,
      authUserId: profile.authUserId,
    })
      .then((customer) => {
        if (cancelled || !customer) return;

        setCustomerName(
          (current) => current.trim() || customer.name || profile.name,
        );
        setCustomerPhone(
          (current) =>
            current.trim() ||
            (customer.phone ? formatPhone(customer.phone) : ""),
        );
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setAuthError(error.message);
      })
      .finally(() => {
        if (cancelled) return;
      });

    return () => {
      cancelled = true;
    };
  }, [id, isOpen, profile]);

  useEffect(() => {
    if (selectedServiceIds.length === 0) {
      setExpandedServiceId(null);
      return;
    }

    if (expandedServiceId === null) {
      return;
    }

    if (selectedServiceIds.includes(expandedServiceId)) {
      return;
    }

    setExpandedServiceId(selectedServiceIds[0]);
  }, [expandedServiceId, selectedServiceIds]);

  if (!isOpen) return null;

  const canAdvanceFromStep1 = selectedServiceIds.length > 0;
  const canAdvanceFromStep2 = !!selectedDate;
  const canAdvanceFromStep3 =
    selectedServices.length > 0 &&
    selectedServices.every((service) => {
      const selection = serviceSelections.find(
        (item) => item.serviceId === service.id,
      );

      return !!selection?.barberId && !!selection.slot;
    });
  const canFinalize =
    !!profile &&
    customerName.trim().length >= 3 &&
    customerPhone.replace(/\D/g, "").length >= 10 &&
    !isSubmitting &&
    !submitSuccess;
  const availabilityLoading = availability === null && !availabilityError;
  const appointmentsLoading =
    step >= 3 && appointments === null && !appointmentsError;
  const isSelectedDateOpen = isDateOpen(openingHours, selectedDate);

  const syncServiceSelections = (serviceIds: string[]) => {
    setServiceSelections((current) => {
      const nextSelections = serviceIds.map(
        (serviceId) =>
          current.find((item) => item.serviceId === serviceId) ?? {
            serviceId,
            barberId: null,
            slot: null,
          },
      );

      return nextSelections;
    });
  };

  const goNext = () => {
    if (step === 1 && !canAdvanceFromStep1) return;
    if (step === 2 && !canAdvanceFromStep2) return;
    if (step === 3 && !canAdvanceFromStep3) return;
    if (step === 4) return;

    setStep((current) => (current + 1) as BookingStep);
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((current) => (current - 1) as BookingStep);
  };

  const goToStep = (targetStep: BookingStep) => {
    if (targetStep > step) return;
    setStep(targetStep);
  };

  const toggleService = (serviceId: string) => {
    setAppointments(null);
    setAppointmentsError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
    setSelectedServiceIds((current) => {
      const nextServiceIds = current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId];

      syncServiceSelections(nextServiceIds);
      return nextServiceIds;
    });
  };

  const scrollToServiceCard = (serviceId: string) => {
    const target = serviceCardRefs.current[serviceId];
    if (!target) return;

    const targetTop = target.getBoundingClientRect().top + window.scrollY - 40;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  };

  const handleCompleteServiceSelection = (
    serviceId: string,
    slot: BarberSlot,
  ) => {
    updateServiceSelection(serviceId, { slot });

    const currentIndex = selectedServices.findIndex(
      (service) => service.id === serviceId,
    );
    const nextService = selectedServices[currentIndex + 1];

    if (nextService) {
      setExpandedServiceId(nextService.id);
      window.setTimeout(() => {
        scrollToServiceCard(nextService.id);
      }, 180);
      return;
    }

    setExpandedServiceId(null);
  };

  const handleOpenAppointmentsFromSuccess = () => {
    onClose();
    window.setTimeout(() => {
      openMyAppointmentsModal();
    }, 0);
  };

  const updateServiceSelection = (
    serviceId: string,
    changes: Partial<Omit<ServiceSelection, "serviceId">>,
  ) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    setServiceSelections((current) =>
      current.map((item) =>
        item.serviceId === serviceId ? { ...item, ...changes } : item,
      ),
    );
  };

  const changeSelectedDate = (date: string) => {
    setSelectedDate(date);
    setCalendarMonth(getMonthStart(date));
    setServiceSelections((current) =>
      current.map((item) => ({
        ...item,
        barberId: null,
        slot: null,
      })),
    );
    setAppointments(null);
    setAppointmentsError(null);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const moveDate = (direction: 1 | -1) => {
    const nextDate = addDays(selectedDate, direction);

    if (direction < 0 && nextDate < today) {
      return;
    }

    changeSelectedDate(nextDate);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      setIsStartingOAuth(true);

      sessionStorage.setItem(
        BOOKING_OAUTH_RESUME_KEY,
        JSON.stringify({
          serviceIds: selectedServiceIds,
          selectedDate,
          serviceSelections,
          step: 4,
        } satisfies BookingResumePayload),
      );

      await signInWithGoogle(window.location.href);
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel entrar com Google.",
      );
      setIsStartingOAuth(false);
    }
  };

  const handleFinalize = async () => {
    if (!canFinalize || !profile) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const customer = await getOrCreateCustomerFromAuth({
        barbershopId: id,
        authUserId: profile.authUserId,
        email: profile.email,
        name: customerName.trim(),
        phone: customerPhone,
      });

      const appointmentsToCreate = scheduledSelections.map(
        ({ service, selection }) =>
          ({
            barbershop_id: id,
            customer_id: customer.id,
            barber_id: selection.barberId,
            service_id: service.id,
            starts_at: buildAppointmentDateTime(
              selectedDate,
              selection.slot.startsAt,
            ),
            ends_at: buildAppointmentDateTime(
              selectedDate,
              selection.slot.endsAt,
            ),
            notes: null,
          }) satisfies CreateAppointmentInput,
      );

      if (hasAppointmentConflict(appointmentsToCreate)) {
        setSubmitError("Os horários escolhidos entram em conflito entre si.");
        setIsSubmitting(false);
        return;
      }

      await createAppointments(appointmentsToCreate);
      setSubmitSuccess("Agendamento realizado com sucesso.");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel finalizar o agendamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-6">
          <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
            Escolha os serviços
          </h3>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const selected = selectedServiceIds.includes(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  style={{
                    borderColor: selected ? primary_color : `${text_color}30`,
                    backgroundColor: selected ? "transparent" : "transparent",
                    borderWidth: selected ? "3px" : "1px",
                    color: selected ? text_button_color : text_color,
                  }}
                  className="mx-auto flex min-h-32 w-full max-w-96 cursor-pointer flex-col overflow-hidden text-left transition-transform duration-200 hover:-translate-y-1 lg:max-w-none lg:flex-row lg:items-stretch"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="h-44 w-full object-cover lg:h-auto lg:w-64 lg:shrink-0"
                    />
                  ) : (
                    <div
                      style={{
                        backgroundColor: text_color,
                        color: background_color,
                      }}
                      className="flex items-center justify-center opacity-50 h-44 w-full lg:h-auto lg:w-54 lg:shrink-0"
                    >
                      <Scissors size={108} />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between gap-4 p-4 lg:p-6">
                    <div>
                      <p className="text-lg font-black uppercase lg:text-lg">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="mt-2 text-sm opacity-80">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold uppercase">
                      <span>{service.duration_min ?? 0} min</span>
                      <span>
                        {service.price != null
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(service.price)
                          : ""}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 2) {
      const calendarDays = getCalendarDays(calendarMonth);

      return (
        <div className="space-y-6 max-w-95 mx-auto my-auto">
          <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
            Escolha a data
          </h3>

          <div className="w-75 mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() - 1,
                    1,
                  ),
                )
              }
              style={{ borderColor: `${text_color}30`, color: text_color }}
              className="cursor-pointer border p-2 transition-opacity hover:opacity-70"
            >
              <ChevronLeft className="size-5" />
            </button>

            <p className="text-center text-sm font-black uppercase tracking-[0.2em]">
              {formatMonthLabel(calendarMonth)}
            </p>

            <button
              type="button"
              onClick={() =>
                setCalendarMonth(
                  new Date(
                    calendarMonth.getFullYear(),
                    calendarMonth.getMonth() + 1,
                    1,
                  ),
                )
              }
              style={{ borderColor: `${text_color}30`, color: text_color }}
              className="cursor-pointer border p-2 transition-opacity hover:opacity-70"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="max-w-65 mx-auto grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-[0.25em] opacity-60">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>

          <div className="max-w-65 mx-auto grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const disabled =
                day.iso < today || !isDateOpen(openingHours, day.iso);
              const selected = day.iso === selectedDate;

              return (
                <button
                  key={day.iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => changeSelectedDate(day.iso)}
                  style={{
                    borderColor: selected ? primary_color : `${text_color}`,
                    backgroundColor: selected ? primary_color : "transparent",
                    color: selected ? text_button_color : text_color,
                  }}
                  className={`aspect-square border text-sm font-bold cursor-pointer transition-opacity ${
                    disabled
                      ? "opacity-20"
                      : day.isCurrentMonth
                        ? "hover:opacity-70"
                        : "opacity-80 hover:opacity-70"
                  }`}
                >
                  {day.day}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
            Escolha o profissional e o horário
          </h3>

          <div className="max-w-125 flex items-center justify-between gap-4 mx-auto">
            <button
              type="button"
              onClick={() => moveDate(-1)}
              style={{ borderColor: `${text_color}30`, color: text_color }}
              className="cursor-pointer border p-2 transition-opacity hover:opacity-70"
            >
              <ChevronLeft className="size-5" />
            </button>

            <p className="text-center text-sm font-black uppercase tracking-[0.15em]">
              {formatDateLabel(selectedDate)}
            </p>

            <button
              type="button"
              onClick={() => moveDate(1)}
              style={{ borderColor: `${text_color}30`, color: text_color }}
              className="cursor-pointer border p-2 transition-opacity hover:opacity-70"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {!isSelectedDateOpen ? (
            <p className="flex flex-col text-center gap-2 py-5 items-center text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
              <Store size={56} />
              {`Barbearia nao abre na ${formatWeekdayLabel(selectedDate)}.`}
            </p>
          ) : availabilityLoading || appointmentsLoading ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
              <LoadingComponent
                backgroundColor={background_color}
                color={text_color}
                text="buscando profissionais"
              />
            </p>
          ) : availabilityError || appointmentsError ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
              {availabilityError ?? appointmentsError}
            </p>
          ) : (
            <>
              <div className="space-y-8">
                {availableBarbersByService.map(
                  ({ service, entries }, index) => {
                    const selection =
                      serviceSelections.find(
                        (item) => item.serviceId === service.id,
                      ) ?? null;
                    const selectedBarber = selection?.barberId
                      ? barbers.find(
                          (barber) => barber.id === selection.barberId,
                        )
                      : null;
                    const isExpanded = expandedServiceId === service.id;
                    const selectionProgress = getServiceSelectionProgress({
                      durationMinutes: service.duration_min,
                      price: service.price,
                      barberId: selection?.barberId,
                      slot: selection?.slot,
                    });
                    const toggleServiceCard = () => {
                      setExpandedServiceId((current) =>
                        current === service.id ? null : service.id,
                      );
                    };

                    return (
                      <section
                        onClick={toggleServiceCard}
                        key={service.id}
                        ref={(element) => {
                          serviceCardRefs.current[service.id] = element;
                        }}
                        style={{ borderColor: `${text_color}` }}
                        className="relative cursor-pointer mx-auto max-w-150 space-y-5 border"
                      >
                        <button
                          type="button"
                          className="flex w-full cursor-pointer gap-3 mb-0 pr-14 pt-3 pb-6 pl-3 text-left"
                          aria-label={
                            isExpanded
                              ? `Fechar ${service.name}`
                              : `Abrir ${service.name}`
                          }
                        >
                          <div className="flex items-center">
                            <span
                              style={{
                                backgroundColor: text_color,
                                color: background_color,
                              }}
                              className="w-8 h-8 flex justify-center items-center"
                            >
                              {index + 1}
                            </span>
                            <div className="mt-2 ml-2">
                              <h3 className="text-md font-black uppercase tracking-[0.12em]">
                                {service.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 -translate-y-1.5">
                                <SummaryMetaItem className="opacity-70">
                                  {service.duration_min ?? 0} min
                                </SummaryMetaItem>
                                <span style={{ color: text_color }}>|</span>
                                <SummaryMetaItem className="opacity-70">
                                  {Number(service.price).toLocaleString(
                                    "pt-BR",
                                    {
                                      style: "currency",
                                      currency: "BRL",
                                    },
                                  )}
                                </SummaryMetaItem>
                                <span style={{ color: text_color }}>|</span>
                                <SummaryMetaItem
                                  className={
                                    selectedBarber
                                      ? "opacity-70"
                                      : "font-semibold text-red-600"
                                  }
                                >
                                  {selectedBarber?.name ?? "Barbeiro"}
                                </SummaryMetaItem>
                                <span style={{ color: text_color }}>|</span>
                                <SummaryMetaItem
                                  className={
                                    selection?.slot
                                      ? "opacity-70"
                                      : "font-semibold text-red-600"
                                  }
                                >
                                  {selection?.slot?.startsAt ?? "Horario"}
                                </SummaryMetaItem>
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              borderColor: `${text_color}30`,
                              color: text_color,
                            }}
                            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 px-3 transition-opacity"
                            aria-hidden="true"
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronUp className="size-4" />
                            )}
                          </span>
                        </button>

                        <span
                          className={`absolute top-3 right-3 text-sm font-black uppercase tracking-[0.15em] ${
                            selectionProgress === 4 ? "text-green-600" : ""
                          }`}
                          style={
                            selectionProgress === 4
                              ? undefined
                              : { color: text_color }
                          }
                        >
                          {selectionProgress}/4
                        </span>

                        <div
                          className={`grid transition-all duration-300 px-4 pb-0 ease-out ${
                            isExpanded
                              ? "mt-5 grid-rows-[1fr] opacity-100 pb-5"
                              : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            {entries.length > 0 ? (
                              entries.map((entry) => {
                                const selected =
                                  entry.barber.id === selection?.barberId;
                                const dimmed =
                                  !!selection?.barberId && !selected;
                                const availableBarberSlots = entry.slots.filter(
                                  (slot) => slot.isAvailable,
                                );
                                const barberSlotGroups = selected
                                  ? getSlotPeriodGroups(entry.slots)
                                  : [];

                                return (
                                  <div
                                    key={`${service.id}-${entry.barber.id}`}
                                    style={{
                                      borderWidth: selected ? "3px" : "1px",
                                      borderColor: selected
                                        ? primary_color
                                        : `${text_color}30`,
                                      color: text_color,
                                      opacity: dimmed ? 0.5 : 1,
                                    }}
                                    className="overflow-hidden mb-4 transition-transform duration-200"
                                  >
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        updateServiceSelection(service.id, {
                                          barberId: entry.barber.id,
                                          slot: null,
                                        });
                                      }}
                                      className="flex h-20 w-full z-60 cursor-pointer overflow-hidden text-left lg:items-stretch"
                                    >
                                      <BarberCardImage
                                        name={entry.barber.name}
                                        avatarUrl={entry.barber.avatar_url}
                                        textColor={text_color}
                                      />

                                      <div className="flex flex-1 flex-col justify-between gap-3 p-4 lg:p-5">
                                        <p className="text-lg font-black uppercase lg:text-xl">
                                          {entry.barber.name}
                                        </p>
                                      </div>
                                    </button>

                                    {selected && (
                                      <div
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                        style={{
                                          borderTopColor: `${text_color}20`,
                                        }}
                                        className="space-y-4 border-t p-4"
                                      >
                                        {barberSlotGroups.map((group) => (
                                          <div
                                            key={`${entry.barber.id}-${group.key}`}
                                          >
                                            <p
                                              style={{ color: primary_color }}
                                              className="mb-3 text-xs font-bold uppercase tracking-[0.3em]"
                                            >
                                              {group.label}
                                            </p>

                                            <div className="flex flex-wrap gap-3">
                                              {group.slots.map((slot) => {
                                                const selectedSlot =
                                                  selection.slot?.startsAt ===
                                                    slot.startsAt &&
                                                  selection.slot?.endsAt ===
                                                    slot.endsAt;

                                                return (
                                                  <button
                                                    key={`${service.id}-${entry.barber.id}-${slot.startsAt}-${slot.endsAt}`}
                                                    type="button"
                                                    disabled={!slot.isAvailable}
                                                    onClick={() => {
                                                      if (!slot.isAvailable)
                                                        return;

                                                      handleCompleteServiceSelection(
                                                        service.id,
                                                        slot,
                                                      );
                                                    }}
                                                    style={{
                                                      borderColor: selectedSlot
                                                        ? primary_color
                                                        : `${text_color}30`,
                                                      backgroundColor:
                                                        selectedSlot
                                                          ? primary_color
                                                          : "transparent",
                                                      color: selectedSlot
                                                        ? text_button_color
                                                        : text_color,
                                                      opacity: slot.isAvailable
                                                        ? 1
                                                        : 0.35,
                                                    }}
                                                    className="cursor-pointer border px-2 py-1 text-sm font-bold uppercase tracking-[0.2em] transition-transform duration-200 hover:-translate-y-1 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                                  >
                                                    {slot.label}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ))}

                                        {availableBarberSlots.length === 0 && (
                                          <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
                                            Este profissional esta no
                                            expediente, mas sem horários livres
                                            nesta data.
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
                                Nenhum profissional disponivel para este servico
                                nesta data.
                              </p>
                            )}
                          </div>
                        </div>
                      </section>
                    );
                  },
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    if (step === 4) {
      if (isLoading && !profile) {
        return (
          <div className="mx-auto flex w-full max-w-125 items-center justify-center border px-6 py-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
              Carregando autenticacao...
            </p>
          </div>
        );
      }

      return !profile ? (
        <CustomerAuthCard
          mode={customerAuthMode}
          isLoading={isLoading || isStartingOAuth}
          error={authError}
          textColor={text_color}
          primaryColor={primary_color}
          textButtonColor={text_button_color}
          onChangeMode={setCustomerAuthMode}
          onContinueWithGoogle={handleGoogleLogin}
        />
      ) : (
        <>
          {!submitSuccess && (
            <>
              <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
                Confirme os dados
              </h3>
              <div
                style={{ borderColor: `${text_color}30` }}
                className="space-y-4 border p-5"
              >
                <div className="space-y-3">
                  <div className="flex justify-center lg:justify-start">
                    <span
                      style={{ color: text_color }}
                      className="text-sm font-semibold uppercase tracking-[0.18em]"
                    >
                      {formatDateLabel(selectedDate)}
                    </span>
                  </div>

                  {scheduledSelections.map(({ service, selection, barber }) => (
                    <div
                      key={service.id}
                      style={{ borderColor: `${text_color}20` }}
                      className="flex flex-col gap-3 border px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <Clock3
                            style={{ color: primary_color }}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span className="font-medium">
                            {selection.slot.startsAt}
                          </span>
                          <span className="opacity-50">-</span>
                          <span className="opacity-70">
                            {selection.slot.endsAt}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1.5 text-sm overflow-hidden">
                          <User
                            style={{ color: primary_color }}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span className="truncate font-medium">
                            {barber?.name ?? "Barbeiro"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm lg:justify-start">
                        <Scissors
                          style={{ color: primary_color }}
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <span className="truncate opacity-80">
                          {service.name}
                        </span>
                        <span className="opacity-50">-</span>
                        <span className="font-semibold">
                          {service.price != null
                            ? Number(service.price).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })
                            : "-"}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div
                    style={{ borderColor: `${text_color}20` }}
                    className="flex items-center justify-between border-t pt-4"
                  >
                    <span className="text-sm uppercase opacity-70">Total</span>
                    <span className="text-base font-black uppercase">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(totalSelectedPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {submitSuccess ? (
            <div
              style={{ borderColor: `${text_color}30` }}
              className=" max-w-150 mx-auto mt-4 lg:col-span-2 border p-5"
            >
              <div className="space-y-6 py-6 text-center">
                <div className="flex flex-col items-center justify-center gap-3 text-emerald-500">
                  <CheckCircle2 className="size-6" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                    {submitSuccess}
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleOpenAppointmentsFromSuccess}
                    style={{
                      backgroundColor: text_color,
                      color: background_color,
                    }}
                    className="cursor-pointer border border-black px-5 py-3 text-sm font-black uppercase tracking-[0.2em]"
                  >
                    Ver meus agendamentos
                  </button>
                </div>
              </div>
            </div>
          ) : submitError ? (
            <div
              style={{ borderColor: `${text_color}30` }}
              className=" max-w-150 mx-auto mt-4 lg:col-span-2 border p-5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                Erro ao agendar: {submitError}. Tente novamente mais tarde.
              </p>
            </div>
          ) : null}
        </>
      );
    }
  };

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
            color: text_color,
            borderColor: text_color,
            backgroundColor: background_color,
          }}
          className="absolute flex items-center justify-center top-4 right-6 z-10 cursor-pointer border px-4 py-3 text-sm font-black uppercase tracking-[0.2em]"
        >
          <span className="inline-flex items-center gap-2">
            <X className="size-4" />
          </span>
        </button>

        {submitSuccess ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            style={{
              borderColor: text_color,
              color: text_color,
              backgroundColor: background_color,
            }}
            className="absolute top-4 left-6 z-10 border px-2 py-2 text-sm font-black uppercase cursor-pointer tracking-[0.2em]"
          >
            <ChevronLeft />
          </button>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (step > 1) {
                goBack();
              } else {
                onClose();
              }
            }}
            style={{
              borderColor: text_color,
              color: text_color,
              backgroundColor: background_color,
            }}
            className="absolute top-4 left-6 z-10 border px-2 py-2 text-sm font-black uppercase cursor-pointer tracking-[0.2em]"
          >
            <ChevronLeft />
          </button>
        )}

        <div
          style={{ backgroundColor: background_color, color: text_color }}
          className="relative h-full w-full overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24 md:px-10">
            {!submitSuccess && (
              <div className="mb-8 flex flex-wrap mx-auto gap-3">
                {STEP_LABELS.map((label, index) => (
                  <StepTag
                    key={label}
                    active={index + 1 === step}
                    done={index + 1 < step}
                    disabled={index + 1 > step}
                    label={`${index + 1}. ${label}`}
                    primaryColor={primary_color}
                    textColor={text_color}
                    textButtonColor={text_button_color}
                    onClick={() => goToStep((index + 1) as BookingStep)}
                  />
                ))}
              </div>
            )}

            <div className="flex-1">{renderStepContent()}</div>

            <div className="mt-8 flex justify-end pt-6">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !canAdvanceFromStep1) ||
                    (step === 2 && !canAdvanceFromStep2) ||
                    (step === 3 && !canAdvanceFromStep3)
                  }
                  style={{
                    backgroundColor: text_color,
                    color: background_color,
                    opacity:
                      (step === 1 && !canAdvanceFromStep1) ||
                      (step === 2 && !canAdvanceFromStep2) ||
                      (step === 3 && !canAdvanceFromStep3)
                        ? 0.4
                        : 1,
                  }}
                  className="border-3 fixed bottom-4 cursor-pointer px-6 py-3 text-sm font-black uppercase tracking-[0.25em]"
                >
                  Continuar
                </button>
              ) : !submitSuccess ? (
                <button
                  type="button"
                  onClick={handleFinalize}
                  disabled={!canFinalize}
                  style={{
                    backgroundColor: text_color,
                    color: background_color,
                    opacity: canFinalize ? 1 : 0.4,
                  }}
                  className="border fixed bottom-4  border-black cursor-pointer px-6 py-3 text-sm font-black uppercase tracking-[0.25em] disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Finalizando..." : "Finalizar"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
