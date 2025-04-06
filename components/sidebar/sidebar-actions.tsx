"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CircleFadingPlus, FolderPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

interface SidebarActionsProps {
  onNewFolder: (name: string) => Promise<void>;
}

export function SidebarActions({ onNewFolder }: SidebarActionsProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const actionButton =
    "bg-foreground text-background border border-1 border-border p-4 cursor-pointer rounded-lg hover:bg-[#383838] hover:text-background dark:hover:bg-[#ccc] dark:hover:text-background";

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      setIsCreating(true);
      try {
        await onNewFolder(newFolderName.trim());
        setNewFolderName("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder");
      } finally {
        setIsCreating(false);
      }
    } else {
      toast.error("Folder name cannot be empty.");
    }
  };

  const handleNewChat = () => {
    // Navigate to root path for new chat
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateFolder();
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem className="space-y-2">
        <SidebarMenuButton className={actionButton} onClick={handleNewChat}>
          <CircleFadingPlus className="h-4 w-4" />
          New Chat
        </SidebarMenuButton>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <SidebarMenuButton
              className={actionButton}
              onClick={() => setIsDialogOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New Folder
            </SidebarMenuButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
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
                  disabled={isCreating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Folder"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
