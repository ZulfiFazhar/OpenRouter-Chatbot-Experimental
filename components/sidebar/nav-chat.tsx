/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import {
  MessageSquareMore,
  PencilLine,
  Trash2,
  FolderPlus,
  MessageSquare,
} from "lucide-react";
import { useSidebarData } from "@/components/sidebar/sidebar-context";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Extended interface to include updatedAt
interface ChatItem {
  id: string;
  name: string;
  url: string;
  isActive?: boolean;
  updatedAt?: string | Date;
}

const getTimeCategory = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  if (date >= today) {
    return "Today";
  } else if (date >= yesterday) {
    return "Yesterday";
  } else if (date >= last7Days) {
    return "Last 7 Days";
  } else if (date >= last30Days) {
    return "Last 30 Days";
  } else {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
};

export function NavChat({ items }: { items: ChatItem[] }) {
  const { deleteChat, renameChat, moveChatToFolder, folders } =
    useSidebarData();
  const router = useRouter();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Group chats by time category
  const groupedChats = useMemo(() => {
    const groups: Record<string, ChatItem[]> = {};

    // Sort items by updatedAt in descending order (newest first)
    const sortedItems = [...items].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    sortedItems.forEach((item) => {
      const date = item.updatedAt ? new Date(item.updatedAt) : new Date();
      const category = getTimeCategory(date);

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return groups;
  }, [items]);

  const handleRenameChat = () => {
    if (chatToRename && newChatName.trim()) {
      renameChat(chatToRename.id, newChatName.trim());
      setIsRenameDialogOpen(false);
      setChatToRename(null);
      setNewChatName("");
    } else {
      toast.error("Chat name cannot be empty");
    }
  };

  const openRenameDialog = (chat: { id: string; name: string }) => {
    setChatToRename(chat);
    setNewChatName(chat.name);
    setIsRenameDialogOpen(true);
  };

  const openDeleteDialog = (chat: { id: string; name: string }) => {
    setChatToDelete(chat);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteChat = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete.id);
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameChat();
    }
  };

  const handleMoveToFolder = (chatId: string, folderId: string) => {
    moveChatToFolder(chatId, folderId);
  };

  // Get time categories in the desired order
  const timeCategories = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days"];
  const otherCategories = Object.keys(groupedChats)
    .filter((category) => !timeCategories.includes(category))
    .sort();

  const orderedCategories = [...timeCategories, ...otherCategories];

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Ungrouped Chats</SidebarGroupLabel>

      {items.length === 0 ? (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No chats yet</p>
          <p className="text-xs">Start a new chat to begin</p>
        </div>
      ) : (
        <SidebarMenu>
          {orderedCategories.map((category) => {
            const categoryChats = groupedChats[category] || [];
            if (categoryChats.length === 0) return null;

            return (
              <div key={category}>
                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground sticky top-7 z-10 bg-sidebar">
                  {category}
                </div>

                {categoryChats.map((item) => (
                  <SidebarMenuItem key={item.id} className="mb-1">
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <SidebarMenuButton
                          asChild
                          isActive={item.isActive}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/c/${item.id}`);
                          }}
                        >
                          <a href={`/c/${item.id}`}>
                            <MessageSquareMore />
                            <span>{item.name}</span>
                          </a>
                        </SidebarMenuButton>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52 rounded-lg">
                        <ContextMenuItem onClick={() => openRenameDialog(item)}>
                          <PencilLine className="text-muted-foreground" />
                          <span>Rename Chat</span>
                        </ContextMenuItem>

                        {folders.length > 0 && (
                          <ContextMenuSub>
                            <ContextMenuSubTrigger className="space-x-2">
                              <FolderPlus className="text-muted-foreground" />
                              <span>Move to Folder</span>
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48 rounded-lg">
                              {folders.map((folder) => (
                                <ContextMenuItem
                                  key={folder.id}
                                  onClick={() =>
                                    handleMoveToFolder(item.id, folder.id)
                                  }
                                >
                                  <span>{folder.title}</span>
                                </ContextMenuItem>
                              ))}
                            </ContextMenuSubContent>
                          </ContextMenuSub>
                        )}

                        <ContextMenuSeparator />
                        <ContextMenuItem onClick={() => openDeleteDialog(item)}>
                          <Trash2 className="text-red-600" />
                          <span className="text-red-600">Delete Chat</span>
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </SidebarMenuItem>
                ))}
              </div>
            );
          })}
        </SidebarMenu>
      )}

      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chat-name">Chat Name</Label>
              <Input
                id="chat-name"
                placeholder="Enter chat name"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameChat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Are you sure you want to delete the chat{" "}
              <strong>
                &quot;
                {chatToDelete?.name}&quot;
              </strong>
              ?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
