import { Clock3, Scissors, User, X, ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useBarbershop } from "../hooks/useBarbershop";
import { useCustomerAuth } from "../hooks/useCustomerAuth";
import {
  cancelCustomerAppointment,
  fetchCustomerAppointments,
  type CustomerAppointmentRecord,
} from "../services/booking.service";
import { findCustomerByAuthUser } from "../services/customer-auth.service";

function formatStoredAppointmentTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatStoredAppointmentDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatAppointmentStatus(status: string | null) {
  if (!status) return "Sem status";

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "scheduled") return "Agendado";
  if (normalizedStatus === "completed") return "Concluido";
  if (normalizedStatus === "no_show") return "Não compareceu";
  if (normalizedStatus.includes("cancel")) return "Cancelado";

  return status;
}

export function MyAppointmentsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { id, style } = useBarbershop();
  const { profile } = useCustomerAuth();
  const { background_color, text_color, primary_color } = style;
  const [appointments, setAppointments] = useState<CustomerAppointmentRecord[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancellingId, setIsCancellingId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const loadAppointments = useCallback(
    async (authUserId: string) => {
      const customer = await findCustomerByAuthUser({
        barbershopId: id,
        authUserId,
      });

      if (!customer) {
        throw new Error("Cliente nao encontrado para esta conta.");
      }

      setCustomerId(customer.id);

      return fetchCustomerAppointments({
        barbershopId: id,
        customerId: customer.id,
      });
    },
    [id],
  );

  useEffect(() => {
    if (!isOpen || !profile) {
      setAppointments([]);
      setCustomerId(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    loadAppointments(profile.authUserId)
      .then((result) => {
        if (cancelled || !result) return;
        setError(null);
        setAppointments(result);
      })
      .catch((fetchError: Error) => {
        if (cancelled) return;
        setError(fetchError.message);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, loadAppointments, profile]);

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!profile?.authUserId || !customerId || isCancellingId) return;

    try {
      setIsCancellingId(appointmentId);
      setError(null);

      await cancelCustomerAppointment({
        appointmentId,
        customerId,
      });

      const refreshedAppointments = await loadAppointments(profile.authUserId);
      setAppointments(refreshedAppointments);
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Nao foi possivel cancelar o agendamento.",
      );
    } finally {
      setIsCancellingId(null);
    }
  };

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
          style={{ backgroundColor: background_color, color: text_color }}
          className="absolute top-4 left-6 z-10 border px-2 py-2 text-sm font-black uppercase cursor-pointer tracking-[0.2em]"
        >
          <ChevronLeft />
        </button>

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
          className="absolute cursor-pointer top-4 right-6 z-10 flex items-center justify-center border px-4 py-3 text-sm font-black uppercase tracking-[0.2em]"
        >
          <span className="inline-flex items-center gap-2">
            <X className="size-4" />
          </span>
        </button>

        <div
          style={{ backgroundColor: background_color, color: text_color }}
          className="relative h-full w-full overflow-hidden"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24 md:px-10">
            <h3 className="text-center text-xl font-black uppercase tracking-[0.18em] md:text-2xl">
              Meus agendamentos
            </h3>

            <div
              style={{ borderColor: `${text_color}30` }}
              className="mt-8 space-y-4 border p-5"
            >
              {isLoading ? (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
                  Carregando agendamentos...
                </p>
              ) : error ? (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-500">
                  {error}
                </p>
              ) : appointments.length === 0 ? (
                <p className="text-sm font-semibold uppercase tracking-[0.2em] opacity-70">
                  Nenhum agendamento encontrado.
                </p>
              ) : (
                appointments.map((appointment) => {
                  const normalizedStatus =
                    appointment.status?.toLowerCase() ?? "";
                  const isScheduled = normalizedStatus === "scheduled";
                  const isNoShow = normalizedStatus === "no_show";
                  const isCancelled = normalizedStatus.includes("cancel");
                  const statusStyles = isScheduled
                    ? {
                        backgroundColor: "#123BBA",
                        color: "#FFFFFF",
                      }
                    : isNoShow
                      ? {
                          backgroundColor: "#9CA3AF",
                          color: "#000000",
                        }
                      : isCancelled
                        ? {
                            backgroundColor: "#DC2626",
                            color: "#FFFFFF",
                          }
                        : {
                            backgroundColor: "transparent",
                            color: text_color,
                          };

                  return (
                  <div
                    key={appointment.id}
                    style={{ borderColor: `${text_color}20` }}
                    className="flex flex-col gap-3 border px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <span
                            style={{ color: text_color }}
                            className="font-semibold uppercase tracking-[0.18em]"
                          >
                            {formatStoredAppointmentDate(appointment.starts_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-sm shrink-0">
                          <Clock3
                            style={{ color: primary_color }}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span className="font-medium">
                            {formatStoredAppointmentTime(appointment.starts_at)}
                          </span>
                          <span className="opacity-50">-</span>
                          <span className="opacity-70">
                            {formatStoredAppointmentTime(appointment.ends_at)}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1.5 text-sm overflow-hidden">
                          <User
                            style={{ color: primary_color }}
                            className="h-3.5 w-3.5 shrink-0"
                          />
                          <span className="truncate font-medium">
                            {appointment.barber?.name ?? "Barbeiro"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm lg:justify-start">
                        <Scissors
                          style={{ color: primary_color }}
                          className="h-3.5 w-3.5 shrink-0"
                        />
                        <span className="truncate opacity-80">
                          {appointment.service?.name ?? "Servico"}
                        </span>
                        <span className="opacity-50">-</span>
                        <span className="font-semibold">
                          {appointment.service?.price != null
                            ? Number(appointment.service.price).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                },
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1 lg:items-center lg:justify-center">
                      <span
                        style={{
                          borderColor: `${text_color}25`,
                          ...statusStyles,
                        }}
                        className="border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                      >
                        {formatAppointmentStatus(appointment.status)}
                      </span>

                      {isScheduled && (
                        <button
                          type="button"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={isCancellingId === appointment.id}
                          className="cursor-pointer px-3 py-2 text-xs tracking-[0.18em] text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isCancellingId === appointment.id
                            ? "Cancelando..."
                            : "cancelar"}
                        </button>
                      )}
                    </div>
                  </div>
                )})
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
