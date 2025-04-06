"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useModel } from "@/components/model-context";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

export function AppHeader() {
  const { activeModel, activeSubModel, setActiveSubModelId } = useModel();

  return (
    <header className="bg-background sticky top-0 flex h-16 items-center px-4 z-10">
      <SidebarTrigger />
      <div className="flex flex-1 justify-center sm:justify-start items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-1 items-center justify-center cursor-pointer hover:bg-secondary rounded-md p-2 text-sm font-bold">
            {activeSubModel.name}
            <ChevronDown size={14} strokeWidth={4} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-sm">
              Switch Model
            </DropdownMenuLabel>
            {activeModel.subModels.map((subModel) => (
              <DropdownMenuItem
                key={subModel.id}
                onClick={() => setActiveSubModelId(subModel.id)}
                className="flex items-center gap-2"
              >
                <div className="flex size-5 items-center justify-center rounded-sm border">
                  <DynamicIcon name={activeModel.iconName} />
                </div>
                <div className="flex flex-col">
                  <span>{subModel.name}</span>
                  <span className="text-sm text-ring">
                    {subModel.description}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <ThemeSwitcher />
      </div>
    </header>
  );
}
