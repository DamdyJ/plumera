import { RouterProvider } from "@tanstack/react-router";
import { ClerkWrapper } from "./auth/clerk";
import { useClerkAuth } from "./hooks/useClerkAuth";
import { getRouter } from "./router";
import { QueryClientProvider } from "@tanstack/react-query";

const { router, queryClient } = getRouter();

function InnerApp() {
  const auth = useClerkAuth();

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

export default function App() {
  return (
    <ClerkWrapper>
      <QueryClientProvider client={queryClient}>
        <InnerApp />
      </QueryClientProvider>
    </ClerkWrapper>
  );
}
