import { Outlet, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";
import NotFoundComponent from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import type { RouterContext } from "@/types/router-context";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => {
    return <NotFoundComponent />;
  },
});

function RootComponent() {
  const isTransitioning = useRouterState({
    select: (state) => state.status === "pending",
  });
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {isTransitioning ? (
        <div className="fixed top-0 right-0 left-0 z-9999 h-1 animate-pulse bg-blue-500" />
      ) : null}
      <Outlet />
      <TanStackRouterDevtools />
    </ThemeProvider>
  );
}
