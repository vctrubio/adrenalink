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
        relative bg-slate-800/80 rounded-xl cursor-pointer transition-all duration-300
        h-52 overflow-hidden border border-slate-700
        ${isSelected ? "shadow-2xl scale-105 border-2" : ""}
        ${isRelated ? "border-2" : ""}
        ${isHovered && !isSelected ? "scale-105 shadow-lg bg-slate-800" : ""}
      `}
            style={{
                backgroundColor: isSelected ? entity.bgColor + "40" : undefined,
                borderColor: isRelated ? entity.color : isSelected ? entity.bgColor : undefined,
            }}
        >
            <div className="h-full px-4 py-4 flex flex-col justify-center items-center">
                <div
                    className={`
              rounded-full p-3 border-2 transition-all duration-300
              ${isHovered ? "scale-110 shadow-xl" : "shadow-md"}
            `}
                    style={{
                        borderColor: isSelected ? entity.color : entity.color + "4d",
                        color: entity.color,
                    }}
                >
                        <Icon className="w-10 h-10" />
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

            {/* === NO BADGE - Just border color when related === */}
        </div>
    );
}
