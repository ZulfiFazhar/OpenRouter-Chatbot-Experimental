"use client";

import type React from "react";

import {
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Trash2,
  PencilLine,
  MessageSquarePlus,
  FolderIcon,
  type LucideIcon,
} from "lucide-react";
import { useSidebarData } from "@/components/sidebar/sidebar-context";
import { useChat } from "@/components/chat/chat-context";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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

export function NavFolder({
  items,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      id: string;
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}) {
  const {
    deleteFolder,
    deleteChatFromFolder,
    renameFolder,
    renameChatInFolder,
    addChatToFolder,
  } = useSidebarData();
  const { createNewChat } = useChat();
  const router = useRouter();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [isRenameChatDialogOpen, setIsRenameChatDialogOpen] = useState(false);
  const [chatToRename, setChatToRename] = useState<{
    id: string;
    title: string;
    folderId: string;
  } | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // State for dialog confirmations
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] =
    useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleteChatDialogOpen, setIsDeleteChatDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{
    id: string;
    title: string;
    folderId: string;
  } | null>(null);

  const handleCreateChatInFolder = async (
    folderId: string,
    folderTitle: string
  ) => {
    try {
      setIsCreatingChat(true);
      const folderSlug = folderTitle.toLowerCase().replace(/\s+/g, "-");

      // Create a new chat in the folder
      const chatId = await createNewChat(folderId, folderSlug);

      // Log for debugging
      console.log("Created chat in folder:", { chatId, folderId, folderSlug });

      // Add the chat to the folder in the sidebar context
      await addChatToFolder(
        "New Chat", // Default title, will be updated later
        folderId,
        chatId
      );

      // Redirect to the new chat with the correct URL format
      router.push(`/c/${folderSlug}-${chatId}`);

      toast.success(`New chat created in ${folderTitle}`);
    } catch (error) {
      console.error("Error creating chat in folder:", error);
      toast.error("Failed to create new chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleRenameFolder = () => {
    if (folderToRename && newFolderName.trim()) {
      renameFolder(folderToRename.id, newFolderName.trim());
      setIsRenameDialogOpen(false);
      setFolderToRename(null);
      setNewFolderName("");
    } else {
      toast.error("Folder name cannot be empty");
    }
  };

  const handleRenameChat = () => {
    if (chatToRename && newChatName.trim()) {
      renameChatInFolder(
        chatToRename.id,
        chatToRename.folderId,
        newChatName.trim()
      );
      setIsRenameChatDialogOpen(false);
      setChatToRename(null);
      setNewChatName("");
    } else {
      toast.error("Chat name cannot be empty");
    }
  };

  const openRenameDialog = (folder: { id: string; title: string }) => {
    setFolderToRename(folder);
    setNewFolderName(folder.title);
    setIsRenameDialogOpen(true);
  };

  const openRenameChatDialog = (chat: {
    id: string;
    title: string;
    folderId: string;
  }) => {
    setChatToRename(chat);
    setNewChatName(chat.title);
    setIsRenameChatDialogOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameFolder();
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameChat();
    }
  };

  // Functions for delete confirmations
  const confirmDeleteFolder = (folder: { id: string; title: string }) => {
    setFolderToDelete(folder);
    setIsDeleteFolderDialogOpen(true);
  };

  const handleDeleteFolder = () => {
    if (folderToDelete) {
      deleteFolder(folderToDelete.id);
      setIsDeleteFolderDialogOpen(false);
      setFolderToDelete(null);
    }
  };

  const confirmDeleteChat = (
    chat: { id: string; title: string },
    folderId: string
  ) => {
    setChatToDelete({ ...chat, folderId });
    setIsDeleteChatDialogOpen(true);
  };

  const handleDeleteChat = () => {
    if (chatToDelete) {
      deleteChatFromFolder(chatToDelete.id, chatToDelete.folderId);
      setIsDeleteChatDialogOpen(false);
      setChatToDelete(null);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chat Folders</SidebarGroupLabel>

      {items.length === 0 ? (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No folders yet</p>
          <p className="text-xs">Create a folder to organize your chats</p>
        </div>
      ) : (
        <SidebarMenu>
          {items.map((item) => (
            <Collapsible
              key={item.id}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                        <FolderClosed className="group-data-[state=open]/collapsible:hidden" />
                        <FolderOpen className="group-data-[state=open]/collapsible:block hidden" />
                        <span className="group-data">{item.title}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48 rounded-lg">
                    <ContextMenuItem
                      onClick={() =>
                        handleCreateChatInFolder(item.id, item.title)
                      }
                      disabled={isCreatingChat}
                    >
                      <MessageSquarePlus className="text-muted-foreground" />
                      <span>{isCreatingChat ? "Creating..." : "New Chat"}</span>
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => openRenameDialog(item)}>
                      <PencilLine className="text-muted-foreground" />
                      <span>Rename Folder</span>
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => confirmDeleteFolder(item)}>
                      <Trash2 className="text-red-600" />
                      <span className="text-red-600">Delete Folder</span>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items && item.items.length > 0 ? (
                      item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.id}>
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <SidebarMenuSubButton
                                asChild
                                isActive={subItem.isActive}
                                onClick={(e) => {
                                  // Prevent default to avoid full page reload
                                  e.preventDefault();

                                  // Navigate to the chat with the correct URL format
                                  const folderSlug = item.title
                                    .toLowerCase()
                                    .replace(/\s+/g, "-");

                                  // Log for debugging
                                  console.log("Navigating to folder chat:", {
                                    folderSlug,
                                    chatId: subItem.id,
                                    url: `/c/${folderSlug}-${subItem.id}`,
                                  });

                                  // Navigate to the chat
                                  router.push(`/c/${folderSlug}-${subItem.id}`);
                                }}
                              >
                                <a
                                  href={`/c/${item.title
                                    .toLowerCase()
                                    .replace(/\s+/g, "-")}-${subItem.id}`}
                                >
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48 rounded-lg">
                              <ContextMenuItem
                                onClick={() =>
                                  openRenameChatDialog({
                                    id: subItem.id,
                                    title: subItem.title,
                                    folderId: item.id,
                                  })
                                }
                              >
                                <PencilLine className="text-muted-foreground" />
                                <span>Rename Chat</span>
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              <ContextMenuItem
                                onClick={() =>
                                  confirmDeleteChat(
                                    { id: subItem.id, title: subItem.title },
                                    item.id
                                  )
                                }
                              >
                                <Trash2 className="text-red-600" />
                                <span className="text-red-600">
                                  Delete Chat
                                </span>
                              </ContextMenuItem>
                            </ContextMenuContent>
                          </ContextMenu>
                        </SidebarMenuSubItem>
                      ))
                    ) : (
                      <div className="px-2 py-2 text-xs text-muted-foreground text-center">
                        <p>No chats in this folder</p>
                      </div>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      )}

      {/* Rename Folder Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
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
            <Button onClick={handleRenameFolder}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Chat Dialog */}
      <Dialog
        open={isRenameChatDialogOpen}
        onOpenChange={setIsRenameChatDialogOpen}
      >
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
                onKeyDown={handleChatKeyDown}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRenameChatDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameChat}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog
        open={isDeleteFolderDialogOpen}
        onOpenChange={setIsDeleteFolderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Are you sure you want to delete the folder{" "}
              <strong>
                &quot;
                {folderToDelete?.title}&quot;
              </strong>
              ?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteFolderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteFolder} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog
        open={isDeleteChatDialogOpen}
        onOpenChange={setIsDeleteChatDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete Chat</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>
              Are you sure you want to delete the chat{" "}
              <strong>
                &quot;
                {chatToDelete?.title}&quot;
              </strong>
              ?
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteChatDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteChat} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarGroup>
  );
}
