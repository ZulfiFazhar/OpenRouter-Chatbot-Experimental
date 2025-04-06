"use client";

import { useChat } from "@/components/chat/chat-context";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function ChatInterface() {
  const { currentChat, sendMessage, isLoading, isLoadingChats } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);

  // Check scroll position and show button if needed
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } = container;
      if (scrollTop + clientHeight < scrollHeight - 100) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Show loading state while fetching chats
  if (isLoadingChats) {
    return (
      <div className="flex flex-col gap-4 h-[70vh] items-center justify-center">
        <div className="loader"></div>
        <p className="text-muted-foreground">Loading chats...</p>
      </div>
    );
  }

  const isEmptyChat = !currentChat || currentChat.messages.length === 0;

  return (
    <div
      className={`flex flex-col h-[calc(100vh-5rem)] ${
        isEmptyChat ? "items-center justify-center" : ""
      }`}
    >
      {isEmptyChat ? (
        <div className="flex flex-col items-center text-center gap-1 w-full">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome to the Chat
          </h1>
          <p className="text-sm md:text-xl text-muted-foreground mb-10">
            Start a conversation by typing a message below.
          </p>
          <div className="w-full flex justify-center">
            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              placeholder={
                isLoading ? "AI is thinking..." : "Type a message..."
              }
            />
          </div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-3xl">
              {currentChat.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="relative flex flex-col w-full pb-4">
            {showScrollButton && (
              <div className="w-full flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollToBottom}
                  className="absolute top-[-2rem] md:top-[-2.75rem] left-1/2 transform -translate-x-1/2 rounded-full"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            )}
            <div className="w-full flex justify-center">
              <ChatInput
                onSend={sendMessage}
                isLoading={isLoading}
                placeholder={
                  isLoading ? "AI is thinking..." : "Type a message..."
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
