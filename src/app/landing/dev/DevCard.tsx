"use client";
import type { EntityConfig } from "@/config/entities";

// === BACK COVER: Icon touches top-right edge ===
function DevCardBack({ entity }: { entity: EntityConfig }) {
    const Icon = entity.icon;

    return (
        <div className="absolute inset-0 flex flex-col">
            {/* ICON: Touching top-right corner */}
            <div className="absolute top-3 right-3 z-10">
                <div
                    className={`
            ${entity.color}
          `}
                >
                    <Icon className={`w-8 h-8 ${entity.color}`} />
                </div>
            </div>

            {/* DESCRIPTION: Centered in full space */}
            <div className="flex-1 flex items-center justify-center px-8">
                <div className="text-center space-y-1 max-w-[90%]">
                    {entity.description.map((line, idx) => (
                        <p key={idx} className={`text-lg font-medium ${entity.color}`}>
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}

// === MAIN DEVCARD ===
type DevCardProps = {
    entity: EntityConfig;
    isSelected: boolean;
    isHovered: boolean;
    isRelated: boolean;
    backCover?: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
};

//backCover for user Story
export function DevCard({ entity, isSelected, isHovered, isRelated, backCover = false, onClick, onMouseEnter, onMouseLeave }: DevCardProps) {
    const Icon = entity.icon;

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
        relative bg-card rounded-xl cursor-pointer transition-all duration-300
        h-52 overflow-hidden
        ${isSelected ? "shadow-2xl scale-105" : ""}
        ${isRelated ? "ring-4 ring-secondary/50" : ""}
        ${isHovered && !isSelected ? "scale-105 shadow-lg" : ""}
      `}
            style={{
                backgroundColor: isSelected ? entity.hoverColor + "40" : undefined,
            }}
        >
            {/* === FRONT: Padding applied only here === */}
            {!backCover && (
                <div className="h-full px-6 py-6 flex flex-col justify-center items-center">
                    <div
                        className={`
              rounded-full p-6 border-4 transition-all duration-300
              ${isSelected ? `${entity.color} border-current` : `${entity.color} border-current/30`}
              ${isHovered ? "scale-110 shadow-xl" : "shadow-md"}
            `}
                    >
                        <Icon className={`w-16 h-16 ${entity.color}`} />
                    </div>

                    {/* Name Footer */}
                    <div className="absolute inset-x-0 bottom-0">
                        <div
                            className={`
                h-12 rounded-b-xl blur-xl opacity-70
                ${isSelected ? "bg-current" : "bg-muted"}
              `}
                        />
                        <h3
                            className={`
                absolute inset-x-0 bottom-2 text-center text-lg font-bold
                ${isSelected ? "text-card" : entity.color}
              `}
                        >
                            {entity.name}
                        </h3>
                    </div>
                </div>
            )}

            {/* === BACK: Full bleed, icon touches edge === */}
            {backCover && <DevCardBack entity={entity} />}

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
