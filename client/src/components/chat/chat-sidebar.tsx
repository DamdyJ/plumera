import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LogOut, MessageCircle, MoreHorizontal, SquarePen } from "lucide-react";

export default function ChatSidebar({
  chats,
}: {
  chats: { id: string; chatTitle: string }[];
}) {
  return (
    <Sidebar className="border-none">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="mb-2">
            <h1 className="text-primary px-2 text-xl font-bold">ResumeScout</h1>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href={"/chat"}>
                <SquarePen />
                <span>New chat</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm">Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild>
                    <a href={`/chat/${chat.id}`}>
                      <MessageCircle />
                      <span>{chat.chatTitle}</span>
                    </a>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreHorizontal />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem>
                        <span>Edit Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Delete Project</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="py-4">
          <SignOutButton>
            <SidebarMenuButton className="text-red-600 hover:cursor-pointer hover:bg-red-100">
              <LogOut />
              Logout
            </SidebarMenuButton>
          </SignOutButton>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
