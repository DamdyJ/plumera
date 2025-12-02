import * as React from "react";
import { Command, LogOut, SquarePen } from "lucide-react";

import { NavChats } from "@/pages/chat/components/ui/nav-chats";
import { TeamSwitcher } from "@/pages/chat/components/ui/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { SignOutButton } from "@clerk/clerk-react";

// This is sample data.
const data = {
  name: "Plumera",
  logo: Command,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to={"/chat"}>
                <SquarePen />
                <span>New chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
        <NavChats />
      </SidebarContent>
      <SidebarFooter>
        <SignOutButton>
          <SidebarMenuButton className="text-red-600 hover:cursor-pointer hover:bg-red-100">
            <LogOut />
            Logout
          </SidebarMenuButton>
        </SignOutButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
