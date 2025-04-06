/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { nanoid } from "@/lib/nanoid";
import { toast } from "sonner";

// Import konstanta event dari chat-context
import { REFRESH_SIDEBAR_EVENT } from "@/components/chat/chat-context";

// Types
export interface Chat {
  id: string;
  name: string;
  url: string;
  isActive?: boolean;
  updatedAt?: string | Date;
}

export interface FolderItem {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
}

export interface Folder {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  items: FolderItem[];
}

interface SidebarContextType {
  chats: Chat[];
  folders: Folder[];
  addChat: (name: string) => Promise<void>;
  addFolder: (name: string) => Promise<void>;
  addChatToFolder: (
    chatName: string,
    folderId: string,
    chatId?: string
  ) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  deleteChatFromFolder: (chatId: string, folderId: string) => Promise<void>;
  renameChat: (id: string, newName: string) => Promise<void>;
  renameFolder: (id: string, newName: string) => Promise<void>;
  moveChatToFolder: (chatId: string, folderId: string) => Promise<void>;
  renameChatInFolder: (
    chatId: string,
    folderId: string,
    newName: string
  ) => Promise<void>;
  refreshSidebar: () => Promise<void>;
  isLoading: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Function to refresh folders data
  const refreshFolders = async () => {
    try {
      const foldersResponse = await fetch("/api/folders");
      if (!foldersResponse.ok) throw new Error("Failed to fetch folders");
      const foldersData = await foldersResponse.json();
      setFolders(foldersData);
    } catch (error) {
      console.error("Error refreshing folders:", error);
    }
  };

  // Function to refresh chats data
  const refreshChats = async () => {
    try {
      const chatsResponse = await fetch("/api/chats");
      if (!chatsResponse.ok) throw new Error("Failed to fetch chats");
      const chatsData = await chatsResponse.json();

      // Filter out chats that are in folders
      const ungroupedChats = chatsData
        .filter((chat: any) => !chat.folderId)
        .map((chat: any) => ({
          id: chat.id,
          name: chat.title,
          url: `/c/${chat.id}`,
          updatedAt: chat.updatedAt || chat.createdAt, // Include updatedAt
        }));

      setChats(ungroupedChats);
    } catch (error) {
      console.error("Error refreshing chats:", error);
    }
  };

  const refreshSidebar = async () => {
    try {
      await refreshFolders();
      await refreshChats();
    } catch (error) {
      console.error("Error refreshing sidebar:", error);
    }
  };

  // Fetch folders and chats on mount
  useEffect(() => {
    refreshSidebar().then(() => setIsLoading(false));
  }, []);

  // Listen for refresh sidebar events
  useEffect(() => {
    const handleRefreshSidebar = () => {
      console.log("Refresh sidebar event received");
      refreshSidebar();
    };

    // Add event listener
    if (typeof window !== "undefined") {
      window.addEventListener(REFRESH_SIDEBAR_EVENT, handleRefreshSidebar);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(REFRESH_SIDEBAR_EVENT, handleRefreshSidebar);
      }
    };
  }, []);

  // Update active state based on current URL
  useEffect(() => {
    if (!pathname) return;

    // Update active state for ungrouped chats
    const updatedChats = chats.map((chat) => ({
      ...chat,
      isActive: pathname === chat.url,
    }));

    if (JSON.stringify(updatedChats) !== JSON.stringify(chats)) {
      setChats(updatedChats);
    }

    // Update active state for folders and folder items
    const updatedFolders = folders.map((folder) => {
      // Check if any chat in this folder is active
      const updatedItems = folder.items.map((item) => {
        // For folder chats, the URL pattern is /c/folder-slug-chatId
        const folderSlug = folder.title.toLowerCase().replace(/\s+/g, "-");
        const folderChatUrl = `/c/${folderSlug}-${item.id}`;
        const isActive = pathname === folderChatUrl;

        return {
          ...item,
          isActive,
        };
      });

      const isFolderActive = updatedItems.some((item) => item.isActive);

      return {
        ...folder,
        isActive: isFolderActive,
        items: updatedItems,
      };
    });

    if (JSON.stringify(updatedFolders) !== JSON.stringify(folders)) {
      setFolders(updatedFolders);
    }
  }, [pathname, chats, folders]);

  const addChat = async (name: string) => {
    try {
      const id = nanoid(10);
      const newChat = {
        id: `chat-${id}`,
        name,
        url: `/c/${id}`,
        updatedAt: new Date().toISOString(), // Add updatedAt
      };

      // Create chat in database
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: newChat.id,
          title: name,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create chat");

      setChats([...chats, newChat]);
      toast.success("Chat created successfully");
    } catch (error) {
      console.error("Error adding chat:", error);
      toast.error("Failed to create chat");
    }
  };

  const addFolder = async (name: string) => {
    try {
      const id = `folder-${nanoid(10)}`;
      const newFolder = {
        id,
        title: name,
        url: "#",
        items: [],
      };

      // Create folder in database
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFolder),
      });

      if (!response.ok) throw new Error("Failed to create folder");

      setFolders([...folders, newFolder]);
      toast.success("Folder created successfully");
    } catch (error) {
      console.error("Error adding folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const addChatToFolder = async (
    chatName: string,
    folderId: string,
    chatId?: string
  ) => {
    try {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) throw new Error("Folder not found");

      // Use provided chatId or generate a new one
      const newChatId = chatId || `folder-chat-${nanoid(10)}`;

      const newItem = {
        id: newChatId,
        title: chatName,
        url: `/c/${folder.title
          .toLowerCase()
          .replace(/\s+/g, "-")}-${newChatId}`,
      };

      const updatedFolder = {
        ...folder,
        items: [...folder.items, newItem],
      };

      // Update folder in database
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFolder),
      });

      if (!response.ok) throw new Error("Failed to add chat to folder");

      // Update local state without refetching
      setFolders(
        folders.map((folder) => {
          if (folder.id === folderId) {
            return updatedFolder;
          }
          return folder;
        })
      );

      toast.success("Chat added to folder");
    } catch (error) {
      console.error("Error adding chat to folder:", error);
      toast.error("Failed to add chat to folder");
    }
  };

  const deleteChat = async (id: string) => {
    try {
      // Delete chat from database
      const response = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats(chats.filter((chat) => chat.id !== id));
      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      // Delete folder from database
      const response = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete folder");

      setFolders(folders.filter((folder) => folder.id !== id));
      toast.success("Folder deleted successfully");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const deleteChatFromFolder = async (chatId: string, folderId: string) => {
    try {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) throw new Error("Folder not found");

      const updatedFolder = {
        ...folder,
        items: folder.items.filter((item) => item.id !== chatId),
      };

      // Update folder in database
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFolder),
      });

      if (!response.ok) throw new Error("Failed to remove chat from folder");

      setFolders(
        folders.map((folder) => {
          if (folder.id === folderId) {
            return updatedFolder;
          }
          return folder;
        })
      );

      toast.success("Chat removed from folder");
    } catch (error) {
      console.error("Error removing chat from folder:", error);
      toast.error("Failed to remove chat from folder");
    }
  };

  const renameChat = async (id: string, newName: string) => {
    try {
      const chatToRename = chats.find((c) => c.id === id);
      if (!chatToRename) throw new Error("Chat not found");

      // Update chat in database
      const response = await fetch(`/api/chats/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...chatToRename,
          title: newName,
          updatedAt: new Date(), // Update the updatedAt field
        }),
      });

      if (!response.ok) throw new Error("Failed to rename chat");

      setChats(
        chats.map((chat) => {
          if (chat.id === id) {
            return {
              ...chat,
              name: newName,
              updatedAt: new Date().toISOString(), // Update the updatedAt field
            };
          }
          return chat;
        })
      );

      toast.success("Chat renamed successfully");
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast.error("Failed to rename chat");
    }
  };

  const renameFolder = async (id: string, newName: string) => {
    try {
      const folderToRename = folders.find((f) => f.id === id);
      if (!folderToRename) throw new Error("Folder not found");

      const updatedFolder = {
        ...folderToRename,
        title: newName,
      };

      // Update folder in database
      const response = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFolder),
      });

      if (!response.ok) throw new Error("Failed to rename folder");

      setFolders(
        folders.map((folder) => {
          if (folder.id === id) {
            return updatedFolder;
          }
          return folder;
        })
      );

      toast.success("Folder renamed successfully");
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  };

  const moveChatToFolder = async (chatId: string, folderId: string) => {
    try {
      // Find the chat to move
      const chatToMove = chats.find((chat) => chat.id === chatId);
      if (!chatToMove) throw new Error("Chat not found");

      // Find the target folder
      const targetFolder = folders.find((f) => f.id === folderId);
      if (!targetFolder) throw new Error("Folder not found");

      // Add the chat to the folder
      const updatedFolder = {
        ...targetFolder,
        items: [
          ...targetFolder.items,
          {
            id: chatId,
            title: chatToMove.name,
            url: chatToMove.url,
          },
        ],
      };

      // Update folder in database
      const folderResponse = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFolder),
      });

      if (!folderResponse.ok) throw new Error("Failed to update folder");

      // Update chat in database to associate with folder
      const chatResponse = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: chatId,
          title: chatToMove.name,
          folderId,
          folderSlug: targetFolder.title.toLowerCase().replace(/\s+/g, "-"),
          updatedAt: new Date(), // Update the updatedAt field
        }),
      });

      if (!chatResponse.ok) throw new Error("Failed to update chat");

      // Update state
      setFolders(
        folders.map((folder) => {
          if (folder.id === folderId) {
            return updatedFolder;
          }
          return folder;
        })
      );

      // Remove the chat from ungrouped chats
      setChats(chats.filter((chat) => chat.id !== chatId));

      toast.success("Chat moved to folder");
    } catch (error) {
      console.error("Error moving chat to folder:", error);
      toast.error("Failed to move chat to folder");
    }
  };

  const renameChatInFolder = async (
    chatId: string,
    folderId: string,
    newName: string
  ) => {
    try {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) throw new Error("Folder not found");

      const updatedFolder = {
        ...folder,
        items: folder.items.map((item) => {
          if (item.id === chatId) {
            return {
              ...item,
              title: newName,
            };
          }
          return item;
        }),
      };

      // Update folder in database
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFolder),
      });

      if (!response.ok) throw new Error("Failed to rename chat in folder");

      // Also update the chat document if it exists
      const chatResponse = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newName,
          updatedAt: new Date(), // Update the updatedAt field
        }),
      });

      setFolders(
        folders.map((folder) => {
          if (folder.id === folderId) {
            return updatedFolder;
          }
          return folder;
        })
      );

      toast.success("Chat renamed successfully");
    } catch (error) {
      console.error("Error renaming chat in folder:", error);
      toast.error("Failed to rename chat");
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        chats,
        folders,
        addChat,
        addFolder,
        addChatToFolder,
        deleteChat,
        deleteFolder,
        deleteChatFromFolder,
        renameChat,
        renameFolder,
        moveChatToFolder,
        renameChatInFolder,
        refreshSidebar,
        isLoading,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarData() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarData must be used within a SidebarProvider");
  }
  return context;
}
