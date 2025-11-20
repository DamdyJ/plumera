import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/")({
  component: RouteComponent,
});

function RouteComponent() {
  <div className="flex min-h-screen items-center justify-center">
    <SignIn redirectUrl="/dashboard" signUpUrl="/sign-up" />
  </div>;
}
