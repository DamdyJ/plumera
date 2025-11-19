import { ChatForm } from "@/components/chat/chat-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center outline outline-red-500">
      <ChatForm />
    </div>
  );
}
