import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "./chat-sidebar";

export default function ChatSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ChatSidebar
        items={[
          {
            title: "Senior Frontend Developer",
            url: "/chat/1",
          },
          {
            title: "Fullstack developer",
            url: "/chat/2",
          },
          {
            title: "How to improve my resume",
            url: "/chat/3",
          },
        ]}
      />

      <main className="bg-sidebar max-h-svh w-full overflow-hidden p-4">
        {children}
      </main>
    </SidebarProvider>
  );
}
