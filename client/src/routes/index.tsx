import FileUpload from "@/components/file-upload";
import { ChartRadialScore } from "@/components/score";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section className="container mx-auto flex min-h-[calc(100svh-65px)] flex-col items-center gap-8 overflow-y-hidden p-4 lg:flex-1 lg:flex-row lg:justify-center lg:gap-12">
      <div className="place-items-center">
        <div className="max-w-xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-display text-primary leading-[1.2] font-bold">
              Chat, Rate, and Fix Your Resume
            </h1>
            <p className="text-card-foreground text-md mx-auto max-w-sm">
              Instantly identify weaknesses, receive fixes, and improve chances
              to interview.
            </p>
          </div>

          <div className="w-full">
            <FileUpload />
          </div>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        <Card className="mx-auto max-w-sm">
          <CardContent className="flex flex-col">
            <div className="mb-4 flex flex-1/12 justify-between lg:mb-0">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Resume Insights</h2>
                <ul className="flex flex-wrap gap-3">
                  <Badge asChild variant={"destructive"}>
                    <li>
                      <X />
                      No Defined Summary
                    </li>
                  </Badge>
                  <Badge asChild variant={"destructive"}>
                    <li>
                      <X />
                      Missing Keywords
                    </li>
                  </Badge>
                </ul>
              </div>
              <div className="w-28">
                <ChartRadialScore score={78} />
              </div>
            </div>
            <div className="w-fit flex-11/12">
              <img
                src="/src/assets/pdf_1.jpg"
                alt="pdf image"
                className="rounded-xl border-8"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
