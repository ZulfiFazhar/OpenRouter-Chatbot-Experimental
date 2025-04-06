"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizontal, BrainCog, Zap, Paperclip } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (
    message: string,
    options: { thinkingOption: boolean; searchOption: boolean }
  ) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [thinkingOption, setThinkingOption] = useState(false);
  const [searchOption, setSearchOption] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message, { thinkingOption, searchOption });
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 max-w-[50rem] min-w-[20rem] w-2/3 bg-muted border border-background rounded-xl">
      <div className="mx-auto max-w-3xl flex flex-col gap-4">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[40px] max-h-[200px] resize-none rounded-lg border-none focus-visible:ring-0 focus-visible:outline-none shadow-none dark:bg-transparent text-xs md:text-sm"
          rows={1}
          disabled={isLoading}
        />

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <label
                htmlFor="file-input"
                className="text-sm p-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full cursor-pointer"
              >
                <Paperclip size={18} />
              </label>
              <input
                id="file-input"
                type="file"
                className="sr-only"
                title="Upload file"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    console.log("Files selected:", files);
                    toast.success(
                      `${files.length} file selected: ${files[0].name}`
                    );
                  } else {
                    toast.error("No files selected.");
                  }
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={"outline"}
                onClick={() => setThinkingOption(!thinkingOption)}
                className={`rounded-full ${
                  thinkingOption
                    ? "bg-foreground hover:bg-foreground/80 text-background hover:text-background dark:bg-foreground dark:hover:bg-foreground/80 dark:text-background dark:hover:text-background"
                    : "bg-background hover:bg-border text-foreground"
                }`}
              >
                <BrainCog className="h-3.5 w-3.5" />
                <span>Thinking</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={"outline"}
                onClick={() => setSearchOption(!searchOption)}
                className={`rounded-full ${
                  searchOption
                    ? "bg-foreground hover:bg-foreground/80 text-background hover:text-background dark:bg-foreground dark:hover:bg-foreground/80 dark:text-background dark:hover:text-background"
                    : "bg-background hover:bg-border text-foreground"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>RAG</span>
              </Button>
            </div>
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="rounded-full"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
