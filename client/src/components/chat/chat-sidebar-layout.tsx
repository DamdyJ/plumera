import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "./chat-sidebar";

type chat = {
  id: string;
  chatTitle: string;
};

export default function ChatSidebarLayout({
  children,
  chats,
}: {
  children: React.ReactNode;
  chats: chat[];
}) {
  return (
    <SidebarProvider>
      <ChatSidebar chats={chats} />

      <main className="bg-sidebar max-h-svh w-full overflow-hidden p-4">
        {children}
      </main>
    </SidebarProvider>
  );
}
