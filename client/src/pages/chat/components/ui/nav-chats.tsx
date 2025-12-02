import { MessageCircle, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useChats } from "@/pages/chat/hooks/useChats";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { Skeleton } from "../../../../components/ui/skeleton";
import { useDeleteChat } from "@/pages/chat/hooks/useDeleteChat";
import { Link, useNavigate } from "react-router";
import { useRenameChat } from "@/pages/chat/hooks/useRenameChat";
import DeleteChatAlert from "@/pages/chat/components/DeleteChatAlert";
import RenameChatDialog from "@/pages/chat/components/RenameChatDialog";

export function NavChats() {
  const navigate = useNavigate();
  const { isMobile } = useSidebar();
  const { data: chats } = useSuspenseQuery(useChats());
  const {
    mutate: deleteChat,
    isPending: isDeleting,
    isSuccess: isDeleted,
  } = useDeleteChat();
  const { mutate: renameChat } = useRenameChat();

  const handleDelete = (id: string) => {
    if (!id) return;
    deleteChat(id);
    if (isDeleted) {
      navigate("/chat");
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        <Suspense
          fallback={
            <SidebarMenuItem>
              <Skeleton className="h-full w-full" />
            </SidebarMenuItem>
          }
        >
          {chats.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <MessageCircle />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <RenameChatDialog
                    onSubmit={(newName) => {
                      renameChat({ id: item.id, chatTitle: newName });
                    }}
                    disabled={false}
                    currentName={item.name}
                  />
                  <DropdownMenuSeparator />
                  <DeleteChatAlert
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </Suspense>
      </SidebarMenu>
    </SidebarGroup>
  );
}
