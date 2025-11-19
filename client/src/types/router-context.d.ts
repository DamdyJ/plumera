import { QueryClient } from "@tanstack/react-query";

interface AuthState {
  isAuthenticated: boolean | undefined;
  user: { id: string; username: string; email: string } | null;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

export interface RouterContext {
  auth: AuthState;
  queryClient: QueryClient;
}