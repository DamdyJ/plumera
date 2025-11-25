import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Header />
      <section className="container mx-auto flex min-h-[calc(100svh-65px)] flex-col items-center gap-8 overflow-y-hidden p-4 lg:flex-1 lg:flex-row lg:justify-center lg:gap-12">
        <div className="place-items-center">
          <div className="max-w-xl space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-display text-primary leading-[1.2] font-bold">
                Chat, Rate, and Fix Your Resume
              </h1>
              <p className="text-card-foreground text-md mx-auto max-w-sm">
                Instantly identify weaknesses, receive fixes, and improve
                chances to interview.
              </p>
            </div>

            <div className="w-full flex justify-center">
              <Button asChild className="">
                <Link to="/chat">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
