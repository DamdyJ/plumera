import ChatSidebarLayout from "@/components/chat/chat-sidebar-layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ChatSidebarLayout>
      <Outlet />
    </ChatSidebarLayout>
  );
}
