"use client";

import type { EntityConfig } from "@/config/entities";

type DevCardProps = {
    entity: EntityConfig;
    isSelected: boolean;
    isHovered: boolean;
    isRelated: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

export function DevCard({ entity, isSelected, isHovered, isRelated, onClick, onMouseEnter, onMouseLeave }: DevCardProps) {
    const Icon = entity.icon;

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
                relative bg-card border-2 rounded-xl p-6 cursor-pointer transition-all duration-300
                ${isSelected ? `border-current ${entity.color} shadow-2xl scale-105` : "border-border hover:border-muted-foreground"}
                ${isRelated ? "ring-4 ring-secondary/50 border-secondary" : ""}
                ${isHovered && !isSelected ? "scale-105 shadow-lg" : ""}
            `}
            style={{
                backgroundColor: isSelected ? entity.hoverColor + "40" : undefined,
            }}
        >
            <div className={`${entity.bgColor} p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-transform ${isHovered ? "scale-110" : ""}`}>
                <Icon className={`${entity.color} w-8 h-8`} size={32} />
            </div>
            <h3 className={`text-center font-semibold ${entity.color} mb-2`}>{entity.name}</h3>
            <div className="text-sm text-center text-muted-foreground space-y-1 font-bold">
                {entity.description.map((desc, idx) => (
                    <p key={idx}>{desc}</p>
                ))}
            </div>
            {isRelated && (
                <div className={`absolute -top-2 -right-2 ${entity.bgColor} ${entity.color} text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center animate-pulse ring-2 ring-secondary`}>
                    {entity.relations.length}
                </div>
            )}
        </div>
    );
}
