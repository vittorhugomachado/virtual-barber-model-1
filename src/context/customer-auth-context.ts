import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { AuthCustomerProfile } from "../services/customer-auth.service";

export interface CustomerAuthContextValue {
  isLoading: boolean;
  session: Session | null;
  profile: AuthCustomerProfile | null;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const CustomerAuthContext =
  createContext<CustomerAuthContextValue | null>(null);
