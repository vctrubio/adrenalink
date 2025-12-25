"use client";

import { LeftColumnCard } from "./LeftColumnCard";
import type { LeftColumnCardData } from "@/types/left-column";

interface EntityLeftColumnProps {
  header: string;
  cards: (LeftColumnCardData | null)[];
}

export function EntityLeftColumn({ header, cards }: EntityLeftColumnProps) {
  const visibleCards = cards.filter((card) => card !== null);

  return (
    <div className="h-full overflow-y-auto space-y-4">
      <div className="px-2 pt-2">
        <h1 className="text-2xl font-bold text-foreground text-center">{header}</h1>
      </div>
      {visibleCards.map((card, index) => (
        <LeftColumnCard key={index} {...card} />
      ))}
    </div>
  );
}
