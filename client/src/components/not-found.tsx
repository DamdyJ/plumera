import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function NotFoundComponent() {
  return (
    <>
      <div className="flex min-h-[calc(100svh-65px)] flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-1">
          <h2 className="text-8xl font-semibold">404</h2>
          <p className="text-2xl">Page not found</p>
        </div>
        <Button asChild className="px-8 py-6">
          <Link to="/">Go back to homepage</Link>
        </Button>
      </div>
    </>
  );
}
