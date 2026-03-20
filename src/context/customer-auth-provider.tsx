import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CustomerAuthContext } from "./customer-auth-context";
import {
  getAuthCustomerProfile,
  getCustomerSession,
  onCustomerAuthChange,
  signInCustomerWithGoogle,
  signOutCustomer,
} from "../services/customer-auth.service";
import type { Session } from "@supabase/supabase-js";

interface CustomerAuthProviderProps {
  children: ReactNode;
}

export function CustomerAuthProvider({
  children,
}: CustomerAuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getCustomerSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = onCustomerAuthChange((nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      session,
      profile: getAuthCustomerProfile(session),
      signInWithGoogle: signInCustomerWithGoogle,
      signOut: signOutCustomer,
    }),
    [isLoading, session],
  );

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}
