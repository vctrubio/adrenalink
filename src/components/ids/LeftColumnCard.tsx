"use client";

import { useState, type ReactNode } from "react";
import { ToggleAdranalinkIcon } from "@/src/components/ui/ToggleAdranalinkIcon";
import { Card } from "@/src/components/ui/card";
import { CardList } from "@/src/components/ui/card/card-list";

interface LeftColumnCardProps {
    name: string | ReactNode;
    status: ReactNode;
    avatar: ReactNode;
    fields: { label: string; value: string | ReactNode }[];
    accentColor: string;
    isEditable?: boolean;
    isAddable?: boolean;
    onEdit?: () => void;
    onAdd?: () => void;
}

export function LeftColumnCard({
    name,
    status,
    avatar,
    fields,
    accentColor,
    isEditable = false,
    isAddable = false,
    onEdit,
    onAdd,
}: LeftColumnCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div onClick={() => setIsOpen(!isOpen)} className="w-full text-left outline-none cursor-pointer group/card">
            <Card accentColor={accentColor} className="w-full">
                <div className="flex items-start justify-between gap-4 transition-colors group-hover/card:bg-muted/30 -m-4 p-4">
                    <div className="flex items-center gap-6 flex-1">
                        {avatar}
                        <div className="flex-1">
                            <h3 className="text-3xl font-bold text-foreground">{name}</h3>
                            <div
                                className="text-xs uppercase tracking-wider text-muted-foreground"
                                onClick={(e) => e.stopPropagation()} // Prevent expansion when clicking status label buttons
                            >
                                {status}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isEditable && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.();
                                }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
                                style={{ color: accentColor, borderColor: accentColor }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${accentColor}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                Edit
                            </div>
                        )}
                        {isAddable && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAdd?.();
                                }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer"
                                style={{ color: accentColor, borderColor: accentColor }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = `${accentColor}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }}
                            >
                                Add
                            </div>
                        )}
                        <ToggleAdranalinkIcon isOpen={isOpen} color={accentColor} />
                    </div>
                </div>
                {isOpen && (
                    <div className="px-2">
                        <div className="h-[1px] w-full mt-4 mb-4 opacity-20" style={{ backgroundColor: accentColor }} />
                        <CardList fields={fields} />
                    </div>
                )}
            </Card>
        </div>
    );
}
