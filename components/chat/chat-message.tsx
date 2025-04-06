import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { getModelNameById } from "@/lib/model-data";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
    timestamp: Date | string;
    modelId?: string; // ID model yang digunakan untuk pesan ini
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  // Ensure timestamp is a Date object
  const timestamp =
    message.timestamp instanceof Date
      ? message.timestamp
      : new Date(message.timestamp);

  // Get model name if available
  const modelName = message.modelId ? getModelNameById(message.modelId) : null;

  return (
    <div
      className={cn(
        "flex w-full items-start gap-2 py-4 overflow-x-hidden",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 sticky top-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col group gap-2",
          isUser ? "max-w-[80%]" : "w-full"
        )}
      >
        <div
          className={cn(
            "rounded-lg px-4 py-3 wrap-anywhere",
            isUser ? "bg-muted text-foreground" : "px-0 pt-1 text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {!isUser && modelName && (
            <>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <span className="text-primary/70 font-medium">{modelName}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 sticky top-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
