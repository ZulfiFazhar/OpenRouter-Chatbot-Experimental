/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type * as React from "react";

import { NavFolder } from "@/components/sidebar/nav-folder";
import { NavChat } from "@/components/sidebar/nav-chat";
import { NavUser } from "@/components/sidebar/nav-user";
import { ModelSwitcher } from "@/components/sidebar/model-switcher";
import { SidebarActions } from "@/components/sidebar/sidebar-actions";
import {
  SidebarProvider,
  useSidebarData,
} from "@/components/sidebar/sidebar-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const userData = {
  name: "User",
  email: "user@example.com",
  avatar: "/placeholder.svg?height=40&width=40",
};

function AppSidebarContent() {
  const { chats, folders, addFolder } = useSidebarData();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="space-y-2">
        <ModelSwitcher />
        <SidebarActions onNewFolder={addFolder} />
      </SidebarHeader>
      <SidebarContent>
        <NavFolder items={folders} />
        <NavChat items={chats} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <SidebarProvider>
      <AppSidebarContent />
    </SidebarProvider>
  );
}
