"use client";

import { RAINBOW_COLORS } from "@/config/rainbow-entities";
import type { EntityConfig } from "@/types/rainbow-types";

export const RainbowIdentityCardHead = ({ entity }: { entity: EntityConfig }) => {
    const shade = entity.shadeId;
    const shadeColor = RAINBOW_COLORS[shade];
    const Icon = entity.icon;

    return (
        <div className="flex gap-3 items-start">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ color: shadeColor.fill }}>
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: shadeColor.fill }}>
                {entity.name}
            </h3>
        </div>
    );
};

export const RainbowIdentityCardList = ({ entity }: { entity: EntityConfig }) => {
    const schemaKeys = Object.keys(entity.info.schema);
    const firstRow = entity.info.rows[0] || [];

    return (
        <div className="space-y-3">
            {schemaKeys.map((fieldName, index) => (
                <div key={fieldName} className="flex items-center justify-between py-2 border-b border-muted/20">
                    <span className="text-xs uppercase tracking-wider text-white/70">{fieldName}</span>
                    <span className="text-sm font-medium text-white">{firstRow[index] || "-"}</span>
                </div>
            ))}
        </div>
    );
};

export const RainbowIdentityCardListWithDescription = ({ entity }: { entity: EntityConfig }) => {
    const schemaKeys = Object.keys(entity.info.schema);
    const firstRow = entity.info.rows[0] || [];
    const Description = entity.description;

    return (
        <div className="space-y-4">
            <div className="text-white/90 text-sm space-y-2">
                <Description />
            </div>
            <div className="border-t border-muted/20" />
            <RainbowIdentityCardList entity={entity} />
        </div>
    );
};

export const RainbowIdentityCard = ({ entity }: { entity: EntityConfig }) => {
    const shade = entity.shadeId;
    const shadeColor = RAINBOW_COLORS[shade];

    return (
        <div className="max-w-3xl mx-auto mt-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div
                className="relative rounded-2xl overflow-hidden border-2 shadow-2xl backdrop-blur-xl"
                style={{
                    borderColor: shadeColor.fill,
                    boxShadow: `0 20px 60px ${shadeColor.fill}40, 0 0 0 4px ${shadeColor.fill}20`,
                }}
            >
                {/* Card Header - Color Stripe */}
                <div
                    className="h-3"
                    style={{
                        background: `linear-gradient(90deg, ${shadeColor.fill}, ${shadeColor.hoverFill})`,
                    }}
                />

                {/* Card Body */}
                <div className="p-8 bg-black/60">
                    <div className="mb-4">
                        <RainbowIdentityCardHead entity={entity} />
                    </div>
                    <RainbowIdentityCardListWithDescription entity={entity} />
                </div>

                {/* Card Footer - Gradient Bar */}
                <div
                    className="h-2"
                    style={{
                        background: `linear-gradient(90deg, ${shadeColor.hoverFill}, ${shadeColor.fill})`,
                    }}
                />
            </div>
        </div>
    );
};
