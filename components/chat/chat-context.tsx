/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { nanoid } from "@/lib/nanoid";
import { toast } from "sonner";

// Tambahkan import untuk useModel
import { useModel } from "@/components/model-context";

// Custom event untuk refresh sidebar
const REFRESH_SIDEBAR_EVENT = "refreshSidebar";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  modelId?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  folderId?: string;
  folderSlug?: string;
  createdAt: Date;
}

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
  createNewChat: (folderId?: string, folderSlug?: string) => Promise<string>;
  addMessageToChat: (
    chatId: string,
    content: string,
    role: "user" | "assistant"
  ) => Promise<void>;
  sendMessage: (
    content: string,
    options: { thinkingOption: boolean; searchOption: boolean }
  ) => Promise<void>;
  isLoading: boolean;
  updateChatTitle: (chatId: string, newTitle: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  isLoadingChats: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper function untuk trigger refresh sidebar event
export function triggerRefreshSidebar() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REFRESH_SIDEBAR_EVENT));
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Tambahkan useModel hook
  const { activeSubModel } = useModel();

  // Fetch chats from API on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoadingChats(true);
        const response = await fetch("/api/chats");
        if (!response.ok) throw new Error("Failed to fetch chats");

        const data = await response.json();
        const formattedChats = data.map((chat: any) => ({
          ...chat,
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            modelId: msg.modelId,
          })),
          createdAt: new Date(chat.createdAt),
        }));

        setChats(formattedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        toast.error("Failed to load chats");
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchChats();
  }, []);

  // Set current chat based on URL
  useEffect(() => {
    if (pathname === "/") {
      setCurrentChat(null);
      return;
    }

    // Improved route pattern matching for both regular chats and folder chats
    const match = pathname.match(/\/c\/(?:([^/]+)-)?([^/]+)/);

    if (match) {
      const [, folderSlug, chatId] = match;

      // Log for debugging
      console.log("Route match:", { folderSlug, chatId, pathname });

      // Find the chat by ID
      const chat = chats.find((c) => c.id === chatId);

      if (chat) {
        console.log("Found chat in local state:", chat);
        setCurrentChat(chat);
      } else if (chatId && !isLoadingChats) {
        console.log(
          "Chat not found in local state, fetching from API:",
          chatId
        );

        // If chat is not in state, try to fetch it directly
        fetch(`/api/chats/${chatId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Chat not found");
            return res.json();
          })
          .then((chatData) => {
            // Format the chat data
            const formattedChat = {
              ...chatData,
              messages: chatData.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
                modelId: msg.modelId,
              })),
              createdAt: new Date(chatData.createdAt),
            };

            // Add to chats state and set as current
            setChats((prev) => {
              // Only add if not already in the list
              if (!prev.some((c) => c.id === chatData.id)) {
                return [...prev, formattedChat];
              }
              return prev;
            });
            setCurrentChat(formattedChat);
          })
          .catch((err) => {
            console.error("Error fetching chat:", err);
            toast.error("Chat not found");
            router.push("/");
          });
      }
    }
  }, [pathname, chats, router, isLoadingChats]);

  const createNewChat = async (folderId?: string, folderSlug?: string) => {
    try {
      const id = nanoid(10);
      const newChat: Chat = {
        id,
        title: "New Chat",
        messages: [],
        folderId,
        folderSlug,
        createdAt: new Date(),
      };

      // Create the chat in the database
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChat),
      });

      if (!response.ok) throw new Error("Failed to create chat");

      const savedChat = await response.json();

      // Update local state
      setChats((prev) => [savedChat, ...prev]);
      setCurrentChat(savedChat);

      return id;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create new chat");
      throw error;
    }
  };

  const addMessageToChat = async (
    chatId: string,
    content: string,
    role: "user" | "assistant"
  ) => {
    try {
      const message: Message = {
        id: nanoid(),
        content,
        role,
        timestamp: new Date(),
      };

      const chatToUpdate = chats.find((c) => c.id === chatId);
      if (!chatToUpdate) {
        console.error(`Chat with ID ${chatId} not found`);
        toast.error("Chat not found");
        return;
      }

      // Update chat title based on first user message if it's still "New Chat"
      let title = chatToUpdate.title;
      if (title === "New Chat" && role === "user") {
        title =
          content.length > 30 ? `${content.substring(0, 30)}...` : content;
      }

      const updatedChat = {
        ...chatToUpdate,
        title,
        messages: [...chatToUpdate.messages, message],
      };

      // Update local state first for immediate UI feedback
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return updatedChat;
          }
          return chat;
        })
      );

      if (currentChat?.id === chatId) {
        setCurrentChat(updatedChat);
      }

      // Then update in database
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChat),
      });

      if (!response.ok) {
        console.error("Failed to update chat in database");
        toast.error("Failed to save message");
        return;
      }

      const savedChat = await response.json();

      // Update with the saved version from database
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return savedChat;
          }
          return chat;
        })
      );

      if (currentChat?.id === chatId) {
        setCurrentChat(savedChat);
      }
    } catch (error) {
      console.error("Error adding message to chat:", error);
      toast.error("Failed to send message");
    }
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    try {
      const chatToUpdate = chats.find((c) => c.id === chatId);
      if (!chatToUpdate) throw new Error("Chat not found");

      const updatedChat = {
        ...chatToUpdate,
        title: newTitle,
      };

      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedChat),
      });

      if (!response.ok) throw new Error("Failed to update chat title");

      const savedChat = await response.json();

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            return savedChat;
          }
          return chat;
        })
      );

      if (currentChat?.id === chatId) {
        setCurrentChat(savedChat);
      }

      toast.success("Chat renamed successfully");
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to rename chat");
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        router.push("/");
      }

      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Dalam fungsi sendMessage, pastikan modelId disimpan dengan benar
  const sendMessage = async (
    content: string,
    options: { thinkingOption: boolean; searchOption: boolean }
  ) => {
    if (!currentChat) {
      // Create a new chat automatically when sending a message from the home page
      try {
        setIsLoading(true);

        // Create a new chat with the first message already included
        const id = nanoid(10);
        const newChat: Chat = {
          id,
          title:
            content.length > 30 ? `${content.substring(0, 30)}...` : content,
          messages: [
            {
              id: nanoid(),
              content,
              role: "user",
              timestamp: new Date(),
              // Tidak perlu menyimpan modelId untuk pesan user
            },
          ],
          createdAt: new Date(),
        };

        // Save the new chat to the database
        const response = await fetch("/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newChat),
        });

        if (!response.ok) throw new Error("Failed to create chat");

        const savedChat = await response.json();

        // Update local state
        setChats((prev) => [savedChat, ...prev]);
        setCurrentChat(savedChat);

        // Update URL
        router.push(`/c/${id}`);

        // Simulate AI response
        setTimeout(async () => {
          const responseOptions = [];
          if (options.thinkingOption) responseOptions.push("Thinking");
          if (options.searchOption) responseOptions.push("Search");

          const optionsText =
            responseOptions.length > 0
              ? `\n\nOptions used: ${responseOptions.join(", ")}`
              : "";

          // Add AI response to the chat
          const message: Message = {
            id: nanoid(),
            content: `Hello! This is a simulated response to your message: "${content}"${optionsText}`,
            role: "assistant",
            timestamp: new Date(),
            // Simpan ID sub-model yang aktif saat ini
            modelId: activeSubModel.id,
          };

          const updatedChat = {
            ...savedChat,
            messages: [...savedChat.messages, message],
          };

          // Update local state first
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === id) {
                return updatedChat;
              }
              return chat;
            })
          );
          setCurrentChat(updatedChat);

          // Then update in database
          const updateResponse = await fetch(`/api/chats/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedChat),
          });

          if (!updateResponse.ok) {
            console.error("Failed to update chat with AI response");
            toast.error("Failed to save AI response");
          }

          // Trigger refresh sidebar event
          triggerRefreshSidebar();

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error in send message flow:", error);
        setIsLoading(false);
        toast.error("Failed to send message");
      }
    } else {
      try {
        setIsLoading(true);

        // Add user message to the chat
        const userMessage: Message = {
          id: nanoid(),
          content,
          role: "user",
          timestamp: new Date(),
          // Tidak perlu menyimpan modelId untuk pesan user
        };

        const updatedChat = {
          ...currentChat,
          messages: [...currentChat.messages, userMessage],
        };

        // Update local state first
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === currentChat.id) {
              return updatedChat;
            }
            return chat;
          })
        );
        setCurrentChat(updatedChat);

        // Then update in database
        const response = await fetch(`/api/chats/${currentChat.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedChat),
        });

        if (!response.ok) {
          console.error("Failed to update chat with user message");
          toast.error("Failed to send message");
          setIsLoading(false);
          return;
        }

        // Simulate AI response
        setTimeout(async () => {
          const responseOptions = [];
          if (options.thinkingOption) responseOptions.push("Thinking");
          if (options.searchOption) responseOptions.push("Search");

          const optionsText =
            responseOptions.length > 0
              ? `\n\nOptions used: ${responseOptions.join(", ")}`
              : "";

          // Add AI response to the chat
          const aiMessage: Message = {
            id: nanoid(),
            content: `This is a simulated response to your message: "${content}"${optionsText}`,
            role: "assistant",
            timestamp: new Date(),
            // Simpan ID sub-model yang aktif saat ini
            modelId: activeSubModel.id,
          };

          const chatWithAiResponse = {
            ...updatedChat,
            messages: [...updatedChat.messages, aiMessage],
          };

          // Update local state first
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === currentChat.id) {
                return chatWithAiResponse;
              }
              return chat;
            })
          );
          setCurrentChat(chatWithAiResponse);

          // Then update in database
          const aiResponse = await fetch(`/api/chats/${currentChat.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chatWithAiResponse),
          });

          if (!aiResponse.ok) {
            console.error("Failed to update chat with AI response");
            toast.error("Failed to save AI response");
          }

          // Trigger refresh sidebar event
          triggerRefreshSidebar();

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error in send message flow:", error);
        setIsLoading(false);
        toast.error("Failed to send message");
      }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        setCurrentChat,
        createNewChat,
        addMessageToChat,
        sendMessage,
        isLoading,
        updateChatTitle,
        deleteChat,
        isLoadingChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export { REFRESH_SIDEBAR_EVENT };
