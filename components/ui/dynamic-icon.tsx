"use client";

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  type LucideIcon,
} from "lucide-react";

interface DynamicIconProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const iconMap: Record<string, LucideIcon> = {
    "gallery-vertical-end": GalleryVerticalEnd,
    "audio-waveform": AudioWaveform,
    command: Command,
  };

  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Fallback jika ikon tidak ditemukan
    return <div className="w-4 h-4 bg-current rounded-sm" {...props} />;
  }

  return <IconComponent {...props} />;
}
