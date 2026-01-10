"use client";

import { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/src/components/ui/card";

interface EntityActionListProps {
    entityId: string;
    entityType: string;
    icon: React.ComponentType<any>;
    iconColor: string;
    accentColor: string;
    count: number;
    items: ReactNode;
    emptyMessage: string;
    addButtonLabel: string;
    onAddClick: () => void;
}

export const EntityActionList = ({
    entityType,
    icon: Icon,
    iconColor,
    accentColor,
    count,
    items,
    emptyMessage,
    addButtonLabel,
    onAddClick,
}: EntityActionListProps) => {
    return (
        <div className="max-w-md mx-auto">
            <div className="rounded-2xl overflow-hidden border shadow-lg bg-card">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3" style={{ color: iconColor }}>
                            <Icon className="w-5 h-5" size={20} />
                            <h2 className="text-lg font-semibold">
                                {entityType} ({count})
                            </h2>
                        </div>
                        <button
                            onClick={onAddClick}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Plus size={16} />
                            {addButtonLabel}
                        </button>
                    </div>
                    {count === 0 ? <p className="text-sm text-muted-foreground">{emptyMessage}</p> : items}
                </div>
            </div>
        </div>
    );
};
