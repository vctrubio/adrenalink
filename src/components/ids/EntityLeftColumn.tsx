"use client";

import { LeftColumnCard } from "./LeftColumnCard";
import type { LeftColumnCardData } from "@/types/left-column";

interface EntityLeftColumnProps {
    cards: (LeftColumnCardData | null)[];
}

export function EntityLeftColumn({ cards }: EntityLeftColumnProps) {
    const visibleCards = cards.filter((card) => card !== null);

    return (
        <div className="h-full overflow-y-auto space-y-4">
            {visibleCards.map((card, index) => (
                <LeftColumnCard key={index} {...card} />
            ))}
        </div>
    );
}
