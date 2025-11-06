import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import NotFoundComponent from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return <NotFoundComponent />;
  },
});

function RootComponent() {
  return (
    <React.Fragment>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Header/>
        <Outlet />
      </ThemeProvider>
    </React.Fragment>
  );
}
