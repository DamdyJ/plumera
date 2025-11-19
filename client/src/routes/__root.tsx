import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import NotFoundComponent from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import type { RouterContext } from "@/types/router-context";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => {
    return <NotFoundComponent />;
  },
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Outlet />
    </ThemeProvider>
  );
}
