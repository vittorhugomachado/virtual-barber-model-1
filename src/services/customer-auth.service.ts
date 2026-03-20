import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { getOrCreateCustomer } from "./booking.service";

export interface AuthCustomerProfile {
  authUserId: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
}

export interface CustomerLinkRecord {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  auth_user_id?: string | null;
}

function isMissingCustomerOAuthColumnsError(error: {
  code?: string;
  message?: string;
  details?: string;
}) {
  const errorText = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""}`;

  return (
    error.code === "42703" ||
    errorText.includes("auth_user_id") ||
    errorText.includes("email")
  );
}

export function getAuthCustomerProfile(
  session: Session | null,
): AuthCustomerProfile | null {
  if (!session?.user) return null;

  const { user } = session;
  const metadata = user.user_metadata;

  return {
    authUserId: user.id,
    email: user.email ?? null,
    name:
      metadata.full_name ??
      metadata.name ??
      user.email?.split("@")[0] ??
      "Cliente",
    avatarUrl: metadata.avatar_url ?? null,
  };
}

export async function getCustomerSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export function onCustomerAuthChange(
  callback: (session: Session | null) => void,
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

export async function signInCustomerWithGoogle(redirectTo: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOutCustomer() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function findCustomerByAuthUser({
  barbershopId,
  authUserId,
}: {
  barbershopId: string;
  authUserId: string;
}) {
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, email, auth_user_id")
    .eq("barbershop_id", barbershopId)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    if (isMissingCustomerOAuthColumnsError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return (data ?? null) as CustomerLinkRecord | null;
}

export async function getOrCreateCustomerFromAuth({
  barbershopId,
  authUserId,
  email,
  name,
  phone,
}: {
  barbershopId: string;
  authUserId: string;
  email: string | null;
  name: string;
  phone: string;
}) {
  const normalizedPhone = phone.replace(/\D/g, "");
  const existingCustomer = await findCustomerByAuthUser({
    barbershopId,
    authUserId,
  });

  if (existingCustomer) {
    const shouldUpdate =
      existingCustomer.name !== name ||
      existingCustomer.phone !== normalizedPhone ||
      (existingCustomer.email ?? null) !== email;

    if (shouldUpdate) {
      const { error } = await supabase
        .from("customers")
        .update({
          name,
          phone: normalizedPhone,
          email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCustomer.id);

      if (error) {
        if (isMissingCustomerOAuthColumnsError(error)) {
          return getOrCreateCustomer({
            barbershopId,
            name,
            phone,
          });
        }

        throw new Error(error.message);
      }
    }

    return {
      ...existingCustomer,
      name,
      phone: normalizedPhone,
      email,
    };
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      barbershop_id: barbershopId,
      auth_user_id: authUserId,
      email,
      name,
      phone: normalizedPhone,
    })
    .select("id, name, phone, email, auth_user_id")
    .single();

  if (error) {
    if (isMissingCustomerOAuthColumnsError(error)) {
      return getOrCreateCustomer({
        barbershopId,
        name,
        phone,
      });
    }

    throw new Error(error.message);
  }

  return data as CustomerLinkRecord;
}
