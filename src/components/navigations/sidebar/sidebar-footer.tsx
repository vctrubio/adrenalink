"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { ENTITY_DATA } from "../../../../config/entities";
import { useSidebar } from "./sidebar";

export function SidebarFooter() {
    const { collapsed } = useSidebar();
    const [expanded, setExpanded] = useState(false);

    if (collapsed) return null;

    const actionEntityIds = ["student", "booking", "studentPackage", "event", "rental"];
    const actionEntities = ENTITY_DATA.filter((entity) => actionEntityIds.includes(entity.id));

    return (
        <div className="p-4">
            <div className="relative">
                {expanded && (
                    <div className="absolute bottom-full left-0 right-0 mb-3 p-3 bg-gradient-to-br from-card to-muted/50 rounded-2xl shadow-xl backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-200">
                        <div className="grid grid-cols-2 gap-2">
                            {actionEntities.map((entity) => {
                                const Icon = entity.icon;
                                return (
                                    <button
                                        key={entity.id}
                                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-background/80 hover:bg-accent transition-colors"
                                        onClick={() => {
                                            console.log(`Add ${entity.name}`);
                                        }}
                                    >
                                        <Icon className={`w-5 h-5 ${entity.color}`} />
                                        <span className="text-xs text-foreground font-medium">{entity.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg transition-all duration-200"
                >
                    <Plus size={20} className={`transition-transform duration-200 ${expanded ? "rotate-45" : ""}`} />
                    <span>Quick Add</span>
                </button>
            </div>
        </div>
    );
}
