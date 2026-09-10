"use client";

import axios from "axios";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { authService } from "@/Services/auth.services";
import type { AuthContextValue, AuthUser, LoginPayload } from "@/Types/auth";

const authUserQueryKey = ["auth", "user"] as const;
const AuthContext = createContext<AuthContextValue | null>(null);

async function getAuthenticatedUser() {
  try {
    return await authService.getCurrentUser();
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    throw error;
  }
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const shouldCheckSession = pathname !== "/" && pathname !== "/Login";
  const currentUserQuery = useQuery({
    queryKey: authUserQueryKey,
    queryFn: getAuthenticatedUser,
    enabled: shouldCheckSession,
    staleTime: 1000 * 60 * 5,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(authUserQueryKey, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.setQueryData<AuthUser | null>(authUserQueryKey, null);
    },
  });

  async function refreshUser() {
    await queryClient.invalidateQueries({ queryKey: authUserQueryKey });
  }

  const value: AuthContextValue = {
    user: currentUserQuery.data ?? null,
    isLoading: currentUserQuery.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
