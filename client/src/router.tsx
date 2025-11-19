import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { RouterContext } from "./types/router-context";

export function getRouter() {
  const queryClient = new QueryClient();
  const auth = {
    isAuthenticated: undefined,
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: false,
  } as RouterContext["auth"];

  const router = createRouter({
    routeTree,
    context: { auth, queryClient } as RouterContext,
    scrollRestoration: true,
    defaultPreload: "intent",
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });
  
  return { router, queryClient };
}
