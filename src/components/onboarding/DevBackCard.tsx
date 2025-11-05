"use client";

import type { EntityConfig } from "@/config/entities";

interface DevBackCardProps {
    entity: EntityConfig;
    onClick: () => void;
}

export function DevBackCard({ entity, onClick }: DevBackCardProps) {
    const Icon = entity.icon;

    return (
        <div
            onClick={onClick}
            className="absolute inset-0 flex flex-col bg-slate-800 rounded-xl cursor-pointer transition-all duration-300 hover:bg-slate-700 border-4 border-current"
            style={{ borderColor: entity.bgColor.replace("bg-", "#") }}
        >
            {/* ICON: Touching top-right corner */}
            <div className="absolute top-3 right-3 z-10">
                <Icon className={`w-8 h-8 ${entity.color}`} />
            </div>

            {/* DESCRIPTION: Centered in full space */}
            <div className="flex-1 flex items-center justify-center px-8">
                <div className="text-center space-y-2 max-w-[90%]">
                    {entity.description.map((line, idx) => (
                        <p key={idx} className="text-base font-medium text-white">
                            {line}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
