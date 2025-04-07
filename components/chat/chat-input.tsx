"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SendHorizontal,
  Paperclip,
  Cog,
  Plus,
  X,
  File,
  Atom,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ChatInputProps {
  onSend: (
    message: string,
    options: { thinkingOption: boolean; searchOption: boolean }
  ) => void;
  isLoading?: boolean;
  placeholder?: string;
}

interface AttachedFile {
  name: string;
  size: number;
  type: string;
  file: File;
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
  const [isOptionDialog, setIsOptionDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Tambahkan state untuk menyimpan nilai input fields
  const [rtfRole, setRtfRole] = useState("");
  const [rtfTask, setRtfTask] = useState("");
  const [rtfFormat, setRtfFormat] = useState("");

  const [cotInstructions, setCotInstructions] = useState("");

  const [risenRole, setRisenRole] = useState("");
  const [risenMainTask, setRisenMainTask] = useState("");
  const [risenSteps, setRisenSteps] = useState("");
  const [risenGoal, setRisenGoal] = useState("");
  const [risenConstraints, setRisenConstraints] = useState("");

  const [rodesRole, setRodesRole] = useState("");
  const [rodesObjective, setRodesObjective] = useState("");
  const [rodesDetails, setRodesDetails] = useState("");
  const [rodesExample, setRodesExample] = useState("");

  const [codInstructions, setCodInstructions] = useState("");
  const [codContext, setCodContext] = useState("");
  const [codBenchmark, setCodBenchmark] = useState("");
  const [codGuidelines, setCodGuidelines] = useState("");

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
      setAttachedFile(null); // Clear attached file after sending
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      });
      toast.success(`File attached: ${file.name}`);
    } else {
      toast.error("No files selected.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    toast.info("File removed");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Tambahkan fungsi untuk menerapkan template RTF
  const applyRtfTemplate = () => {
    const template = `Act like a ${
      rtfRole || "[insert the role you want AI to take]"
    }. Give me a ${rtfTask || "[insert task]"} in ${
      rtfFormat || "[insert format]"
    } format.`;
    setMessage(template);
    setIsOptionDialog(false);
  };

  // Tambahkan fungsi untuk menerapkan template COT
  const applyCotTemplate = () => {
    const template = `${
      cotInstructions || "[insert your prompt instructions]"
    }.\n\nLet's think through it step-by-step.`;
    setMessage(template);
    setIsOptionDialog(false);
  };

  // Tambahkan fungsi untuk menerapkan template RISEN
  const applyRisenTemplate = () => {
    const template = `Role: ${
      risenRole || "[insert the role you want AI to take.]"
    }\n\nMain Task: ${
      risenMainTask || "[Insert the task you want AI to complete.]"
    }\n\nSteps to complete task: ${
      risenSteps || "[Insert numbered list of steps to follow.]"
    }\n\nGoal: ${risenGoal || "[Insert goal of the output]"}\n\nConstraints: ${
      risenConstraints || "[Enter constraints]."
    }`;
    setMessage(template);
    setIsOptionDialog(false);
  };

  // Tambahkan fungsi untuk menerapkan template RODES
  const applyRodesTemplate = () => {
    const template = `R - Role: ${
      rodesRole || "[Insert desired role you want AI to take.]"
    }\n\nO - Objective: ${
      rodesObjective || "[Insert objective you want AI to do.]"
    }\n\nD - Details: ${
      rodesDetails ||
      "[Insert any context or constraints AI needs to create a good output]"
    }\n\nE - Examples: Here are good examples you can use to model your answer.\n\n${
      rodesExample || "[Insert examples of good outputs]"
    }\n\nS - Sense Check: Do you understand the objective and the specific guidelines for this task?`;
    setMessage(template);
    setIsOptionDialog(false);
  };

  // Tambahkan fungsi untuk menerapkan template COD
  const applyCodTemplate = () => {
    const template = `Instructions: Here is ${
      codInstructions || "[insert content you want to improve]"
    }. You will generate increasingly better versions of this content.\n\nRecursion: Repeat the following 2 steps 5 times for a total of 5 iterations.\n\nStep 1. Identify 1-3 points from the initial output which are missing.\n\nStep 2. Write a new improved output of identical length which includes the missing points.\n\nBenchmark: Here is more information on what makes a good ${
      codContext || "[insert context]"
    }: ${
      codBenchmark || "[insert info]"
    }\n\nAdditional guidelines: Follow these specific guidelines ${
      codGuidelines || "[insert guidelines]"
    }.`;
    setMessage(template);
    setIsOptionDialog(false);
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

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="text-sm p-2 border bg-background shadow-xs hover:bg-border hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-full">
                      <Plus strokeWidth={2.5} size={18} />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleAttachClick}>
                      <Paperclip className="mr-1 h-4 w-4" />
                      <span>Attach file</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsOptionDialog(!isOptionDialog)}
                    >
                      <Cog className="mr-1 h-4 w-4" />
                      <span>Prompting Framework</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  title="Attach file"
                  onChange={handleFileChange}
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
                  <Atom className="h-3.5 w-3.5" />
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
                  <Globe className="h-3.5 w-3.5" />
                  <span>Search</span>
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

          {/* Attached file display */}
          {attachedFile && (
            <div className="flex items-center gap-2 p-2 bg-background rounded-lg mt-2 max-w-full sm:max-w-fit wrap-anywhere">
              <File className="h-4 w-4 text-primary" />
              <div className="flex-1 overflow-hidden w-fit">
                <p className="text-xs font-medium truncate">
                  {attachedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-destructive/20 hover:text-destructive ml-4"
                onClick={removeAttachedFile}
              >
                <X size={5} />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isOptionDialog} onOpenChange={setIsOptionDialog}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="text-left">
            <DialogTitle>Prompting Framework</DialogTitle>
            <a
              href="https://www.thepromptwarrior.com/p/5-prompt-frameworks-level-prompts"
              title="5 prompt frameworks to level up your prompts"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs underline text-[#269af2] -mt-1"
            >
              Source
            </a>
          </DialogHeader>
          <Tabs className="w-full flex-1 flex flex-col" defaultValue="rtf">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger className="text-xs sm:text-sm" value="rtf">
                RTF
              </TabsTrigger>
              <TabsTrigger className="text-xs sm:text-sm" value="cot">
                COT
              </TabsTrigger>
              <TabsTrigger className="text-xs sm:text-sm" value="risen">
                RISEN
              </TabsTrigger>
              <TabsTrigger className="text-xs sm:text-sm" value="rodes">
                RODES
              </TabsTrigger>
              <TabsTrigger className="text-xs sm:text-sm" value="cod">
                COD
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="rtf"
              className="overflow-y-auto max-h-[calc(80vh-10rem)]"
            >
              <div className="grid w-full items-center gap-2 mt-2">
                <p
                  className={`text-xs text-justify hover:underline cursor-default ${
                    isExpanded ? "" : "truncate"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  The &quot;R-T-F&quot; prompt framework categorizes requests
                  into Roles, Tasks, and Formats for clearer communication. This
                  is the jack-of-all-trades prompt and can be used for most use
                  cases, even non-work-related ones.
                </p>
                <Label htmlFor="role" className="mt-2">
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  placeholder="insert the role you want AI to take"
                  value={rtfRole}
                  onChange={(e) => setRtfRole(e.target.value)}
                />
                <Label htmlFor="task">Tasks</Label>
                <Input
                  id="task"
                  type="text"
                  placeholder="insert tasks you want AI to do"
                  value={rtfTask}
                  onChange={(e) => setRtfTask(e.target.value)}
                />
                <Label htmlFor="format">Formats</Label>
                <Input
                  id="format"
                  type="text"
                  placeholder="insert format you want AI to use"
                  value={rtfFormat}
                  onChange={(e) => setRtfFormat(e.target.value)}
                />
                <Button className="mt-4" onClick={applyRtfTemplate}>
                  Apply
                </Button>
              </div>
            </TabsContent>
            <TabsContent
              value="cot"
              className="overflow-y-auto max-h-[calc(80vh-10rem)]"
            >
              <div className="grid w-full items-center gap-2 mt-2">
                <p
                  className={`text-xs text-justify hover:underline cursor-default ${
                    isExpanded ? "" : "truncate"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  The chain of thought prompt framework is one that improves
                  LLM’s reasoning by telling AI to go through a problem
                  step-by-step. This makes it especially good for
                  problem-solving or complex analytical tasks.
                </p>
                <Label htmlFor="cot" className="mt-2">
                  Instructions
                </Label>
                <Input
                  id="cot"
                  type="text"
                  placeholder="insert your prompt instructions"
                  value={cotInstructions}
                  onChange={(e) => setCotInstructions(e.target.value)}
                />
                <Button className="mt-4" onClick={applyCotTemplate}>
                  Apply
                </Button>
              </div>
            </TabsContent>
            <TabsContent
              value="risen"
              className="overflow-y-auto max-h-[calc(80vh-10rem)]"
            >
              <div className="grid w-full items-center gap-2 mt-2">
                <p
                  className={`text-xs text-justify hover:underline cursor-default ${
                    isExpanded ? "" : "truncate"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  The RISEN (Role, Instructions, Steps, End Goal, Narrowing)
                  framework provides a structured approach to dissect complex or
                  constrained tasks, such as blog posts or research projects,
                  into actionable components for better execution and focus.
                </p>
                <Label htmlFor="role" className="mt-2">
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  placeholder="insert the role you want AI to take"
                  value={risenRole}
                  onChange={(e) => setRisenRole(e.target.value)}
                />
                <Label htmlFor="mainTask">Main Task</Label>
                <Input
                  id="mainTask"
                  type="text"
                  placeholder="Insert the task you want AI to complete"
                  value={risenMainTask}
                  onChange={(e) => setRisenMainTask(e.target.value)}
                />
                <Label htmlFor="steps">Steps</Label>
                <Textarea
                  id="steps"
                  placeholder="Insert numbered list of steps to follow"
                  className="max-h-[200px]"
                  value={risenSteps}
                  onChange={(e) => setRisenSteps(e.target.value)}
                />
                <Label htmlFor="goal">Goal</Label>
                <Input
                  id="goal"
                  type="text"
                  placeholder="Insert goal of the output"
                  value={risenGoal}
                  onChange={(e) => setRisenGoal(e.target.value)}
                />
                <Label htmlFor="constraints">Constraints</Label>
                <Input
                  id="constraints"
                  type="text"
                  placeholder="Enter constraints"
                  value={risenConstraints}
                  onChange={(e) => setRisenConstraints(e.target.value)}
                />
                <Button className="mt-4" onClick={applyRisenTemplate}>
                  Apply
                </Button>
              </div>
            </TabsContent>
            <TabsContent
              value="rodes"
              className="overflow-y-auto max-h-[calc(80vh-10rem)]"
            >
              <div className="grid w-full items-center gap-2 mt-2">
                <p
                  className={`text-xs text-justify hover:underline cursor-default ${
                    isExpanded ? "" : "truncate"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  The RODES (Role, Objective, Details, Example, Sense Check)
                  framework provides a structured approach to dissect complex or
                  constrained tasks, this one is better used whenever you have
                  good examples of your desired output.
                </p>
                <Label htmlFor="role" className="mt-2">
                  Role
                </Label>
                <Input
                  id="role"
                  type="text"
                  placeholder="insert the role you want AI to take"
                  value={rodesRole}
                  onChange={(e) => setRodesRole(e.target.value)}
                />
                <Label htmlFor="objective">Objective</Label>
                <Input
                  id="objective"
                  type="text"
                  placeholder="insert objective you want AI to do"
                  value={rodesObjective}
                  onChange={(e) => setRodesObjective(e.target.value)}
                />
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  placeholder="Insert any context or constraints AI needs to create a good output"
                  value={rodesDetails}
                  onChange={(e) => setRodesDetails(e.target.value)}
                  className="max-h-[200px]"
                />
                <Label htmlFor="example">Example</Label>
                <Textarea
                  id="example"
                  placeholder="Insert any context or constraints AI needs to create a good output"
                  value={rodesExample}
                  onChange={(e) => setRodesExample(e.target.value)}
                  className="max-h-[200px]"
                />
                <Button className="mt-4" onClick={applyRodesTemplate}>
                  Apply
                </Button>
              </div>
            </TabsContent>
            <TabsContent
              value="cod"
              className="overflow-y-auto max-h-[calc(80vh-10rem)]"
            >
              <div className="grid w-full items-center gap-2 mt-2">
                <p
                  className={`text-xs text-justify hover:underline cursor-default ${
                    isExpanded ? "" : "truncate"
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  The chain of density prompt is a prompt designed to create
                  increasingly better summaries of articles.
                </p>
                <Label htmlFor="instructions" className="mt-2">
                  Instructions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="insert content you want to improve"
                  value={codInstructions}
                  onChange={(e) => setCodInstructions(e.target.value)}
                  className="max-h-[200px]"
                />
                <Label htmlFor="context">Context</Label>
                <Input
                  id="context"
                  type="text"
                  placeholder="insert context"
                  value={codContext}
                  onChange={(e) => setCodContext(e.target.value)}
                />
                <Label htmlFor="benchmark">Benchmark</Label>
                <Input
                  id="benchmark"
                  type="text"
                  placeholder="insert info"
                  value={codBenchmark}
                  onChange={(e) => setCodBenchmark(e.target.value)}
                />
                <Label htmlFor="addGuideline">Additional Guidelines</Label>
                <Input
                  id="addGuideline"
                  type="text"
                  placeholder="insert additional guidelines"
                  value={codGuidelines}
                  onChange={(e) => setCodGuidelines(e.target.value)}
                />
                <Button className="mt-4" onClick={applyCodTemplate}>
                  Apply
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
