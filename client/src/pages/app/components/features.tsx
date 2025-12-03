import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, FileText, Target } from "lucide-react";
import type { ReactNode } from "react";

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-32">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-balance lg:text-5xl">
            Chat-first resume feedback
          </h2>
          <p className="text-muted-foreground mt-4">
            Upload your PDF, tell the AI the job title or paste the JD, then
            chat — get clear edits, a job-fit score, and examples you can paste
            into your CV.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 @min-4xl:max-w-full @min-4xl:grid-cols-3 dark:[--color-muted:var(--color-zinc-900)]">
          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <MessageSquare className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Chat with an AI coach</h3>
            </CardHeader>

            <CardContent>
              <p className="text-sm">
                Ask anything about your resume — tone, structure, relevance —
                and get clear, conversational advice you can act on immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <FileText className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">PDF-aware analysis</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                The AI reads your uploaded PDF/CV and points to exact lines to
                edit — no manual copy/paste required.
              </p>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-none">
            <CardHeader className="pb-3">
              <CardDecorator>
                <Target className="size-6" aria-hidden />
              </CardDecorator>

              <h3 className="mt-6 font-medium">Job-fit score & fixes</h3>
            </CardHeader>

            <CardContent>
              <p className="mt-3 text-sm">
                Get a quick match score against the job description plus
                targeted, copy-ready suggestions to improve your fit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-auto size-36 mask-radial-from-40% mask-radial-to-60% duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">
      {children}
    </div>
  </div>
);
