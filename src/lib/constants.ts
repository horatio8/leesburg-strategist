import type { QuadrantKey } from "./types";

export const QUADRANT_META: Record<
  QuadrantKey,
  {
    title: string;
    subtitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
    hoverBg: string;
    icon: string;
  }
> = {
  "our-story": {
    title: "Our Story",
    subtitle: "What we say about ourselves",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    hoverBg: "hover:bg-blue-100",
    icon: "Shield",
  },
  "the-attack": {
    title: "The Attack",
    subtitle: "What we say about them",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    hoverBg: "hover:bg-red-100",
    icon: "Swords",
  },
  "their-defense": {
    title: "Their Defense",
    subtitle: "What they say about themselves",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    hoverBg: "hover:bg-amber-100",
    icon: "ShieldAlert",
  },
  "the-counter": {
    title: "The Counter",
    subtitle: "What they say about us",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    hoverBg: "hover:bg-purple-100",
    icon: "Undo2",
  },
};

export const MAX_TILES_PER_QUADRANT = 5;
