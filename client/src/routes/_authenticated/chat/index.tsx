import { ChatForm } from "@/components/chat/chat-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <SidebarTrigger className="bg-sidebar size-16 rounded-tr-xl rounded-br-xl border-r shadow-none" />
      <div className="flex min-h-[calc(100svh-64px)] flex-col items-center justify-center">
        <ChatForm />
      </div>
    </>
  );
}
