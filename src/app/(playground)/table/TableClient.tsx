"use client";

import { useState } from "react";
import type { EntityConfig } from "@/config/entities";

export const BETA_ENTITY_IDS = [
  "Student",
  "Teacher",
  "Commission",
  "School Package",
  "Booking",
  "Equipment",
  "Lesson",
  "Event"
] as const;

type ViewMode = "full" | "beta";

type TableClientProps = {
  entities: EntityConfig[];
};

export default function TableClient({ entities }: TableClientProps) {
  const [mode, setMode] = useState<ViewMode>("beta");

  const filteredEntities = mode === "beta"
    ? entities.filter(entity => BETA_ENTITY_IDS.includes(entity.id as any))
    : entities;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Entity Databoard</h1>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setMode("beta")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "beta"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Beta
          </button>
          <button
            onClick={() => setMode("full")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === "full"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Full
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredEntities.map((entity) => {
          const IconComponent = entity.icon;
          return (
            <div
              key={entity.id}
              className="bg-card border border-border rounded-lg p-6 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-start gap-6">
                {/* Icon */}
                <div className={`${entity.bgColor} rounded-lg p-4 flex-shrink-0`}>
                  <IconComponent className={`w-8 h-8 ${entity.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-semibold text-foreground">{entity.name}</h2>
                    <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">
                      {entity.id}
                    </span>
                    <span className="text-sm font-bold text-foreground px-3 py-1 bg-accent rounded-full">
                      Count: {entity.count}
                    </span>
                  </div>

                  {/* Description in bullets */}
                  <ul className="list-disc list-inside space-y-1">
                    {entity.description.map((desc, index) => (
                      <li key={index} className="text-muted-foreground">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
