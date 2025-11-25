import ChatSidebarLayout from "@/components/chat/chat-sidebar-layout";
import { fetchChatByUserId } from "@/lib/getChatByUser";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/chat")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(fetchChatByUserId());
  },
});

function RouteComponent() {
  const { data } = useSuspenseQuery(fetchChatByUserId());
  console.log("DATA: ", data);
  return (
    <ChatSidebarLayout chats={data.data}>
      <Outlet />
    </ChatSidebarLayout>
  );
}
