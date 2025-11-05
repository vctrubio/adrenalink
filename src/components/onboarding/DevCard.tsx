"use client";
import type { EntityConfig } from "@/config/entities";

const tailwindColorMap: Record<string, string> = {
    "bg-indigo-300": "#e0e7ff",
    "bg-yellow-300": "#fef3c7",
    "bg-amber-300": "#fef9c3",
    "bg-orange-200": "#ffedd5",
    "bg-green-300": "#d1fae5",
    "bg-emerald-300": "#d1fae5",
    "bg-blue-300": "#dbeafe",
    "bg-foreground-300": "#e0e7ff",
    "bg-cyan-300": "#e0e7ff",
    "bg-purple-300": "#e9d5ff",
    "bg-sand-200": "#fef3c7",
    "bg-sand-300": "#fef3c7",
    "bg-slate-300": "#f1f5f9",
    "bg-amber-400": "#fcd34d",
    "bg-gray-300": "#e5e7eb",
    "bg-blue-300": "#bbf7d0",
    "bg-sky-300": "#bae6fd",
    "bg-pink-300": "#fbcfe8",
    "bg-red-300": "#fecaca",
    "bg-teal-300": "#99f6e4",
};

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
    const bgColorHex = tailwindColorMap[entity.bgColor] || "#e0e7ff";

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
        relative bg-slate-800/80 rounded-xl cursor-pointer transition-all duration-300
        h-52 overflow-hidden border border-slate-700
        ${isSelected ? "shadow-2xl scale-105 border-2" : ""}
        ${isRelated ? "ring-4 ring-secondary/50" : ""}
        ${isHovered && !isSelected ? "scale-105 shadow-lg bg-slate-800" : ""}
      `}
            style={{
                backgroundColor: isSelected ? bgColorHex + "40" : undefined,
                borderColor: isSelected ? bgColorHex : undefined,
            }}
        >
            <div className="h-full px-4 py-4 flex flex-col justify-center items-center">
                <div
                    className={`
              rounded-full p-3 border-2 transition-all duration-300
              ${isSelected ? `${entity.color} border-current` : `${entity.color} border-current/30`}
              ${isHovered ? "scale-110 shadow-xl" : "shadow-md"}
            `}
                >
                    <Icon className={`w-10 h-10 ${entity.color}`} />
                </div>

                {/* Name Footer */}
                <div className="absolute inset-x-0 bottom-0">
                    <div
                        className={`
                h-8 rounded-b-xl blur-xl opacity-70
                ${isSelected ? "bg-current" : "bg-slate-700"}
              `}
                    />
                    <h3
                        className={`
                absolute inset-x-0 bottom-1 text-center text-sm font-bold
                ${isSelected ? "text-white" : "text-white"}
              `}
                    >
                        {entity.name}
                    </h3>
                </div>
            </div>

            {/* === RELATION BADGE === */}
            {isRelated && (
                <div
                    className={`
            absolute -top-3 -right-3 ${entity.bgColor} ${entity.color}
            text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center
            animate-pulse ring-2 ring-secondary shadow-lg z-20
          `}
                >
                    {entity.relations.length}
                </div>
            )}
        </div>
    );
}
