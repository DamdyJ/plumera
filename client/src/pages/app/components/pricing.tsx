import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router";

export default function Pricing() {
  return (
    <div id="pricing" className="relative py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-balance md:text-4xl lg:text-5xl">
            Always free — forever
          </h2>
          <p className="text-muted-foreground mt-4">
            Everything you need to chat with the AI about your resume and get
            job-specific edits, at no cost.
          </p>
        </div>

        <div className="mt-8 md:mt-20">
          <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
            <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="pb-12 text-center md:pr-12 md:pb-0">
                <h3 className="text-2xl font-semibold">Free</h3>
                <p className="mt-2 text-lg">
                  Free for everyone • No credit card
                </p>

                <span className="mt-12 mb-6 inline-block text-6xl font-bold">
                  <span className="text-4xl">$</span>0
                </span>

                <div className="flex justify-center">
                  <Button asChild size="lg">
                    <Link to="/chat">Start for free</Link>
                  </Button>
                </div>

                <p className="text-muted-foreground mt-12 text-sm">
                  Upload your PDF, paste a job description or title, and chat
                  with an AI that gives practical resume edits.
                </p>
              </div>

              <div className="relative">
                <ul role="list" className="space-y-4">
                  {[
                    "Upload PDF resume/CV (no copy-paste)",
                    "Chat with an LLM for targeted edits",
                    "Instant job-match score and copy-ready suggestions",
                    "Export or copy suggested resume lines",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <Check className="size-4" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-muted-foreground mt-6 text-sm">
                  This is a single-product site focused on resume feedback — no
                  hidden plans, no upsells.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
