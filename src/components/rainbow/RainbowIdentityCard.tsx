"use client";

import { RAINBOW_COLORS } from "@/config/rainbow-entities";
import type { EntityConfig } from "@/types/rainbow-types";

export const RainbowIdentityCardHead = ({ entity }: { entity: EntityConfig }) => {
    const shade = entity.shadeId;
    const shadeColor = RAINBOW_COLORS[shade];
    const Icon = entity.icon;
    const Description = entity.description;

    const avatar = (
        <div
            className="w-24 h-24 flex items-center justify-center flex-shrink-0 rounded-2xl"
            style={{
                backgroundColor: `${shadeColor.fill}20`,
                border: `3px solid ${shadeColor.fill}`,
            }}
        >
            <div style={{ color: shadeColor.fill }}>
                <Icon className="w-16 h-16 flex-shrink-0" />
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex gap-6 mb-4 items-center">
                {avatar}
                <h3 className="text-3xl font-bold text-white flex-shrink-0">{entity.name}</h3>
            </div>
            <div className="text-white/90 text-sm space-y-2">
                <Description />
            </div>
        </div>
    );
};

export const RainbowIdentityCardTable = ({ entity }: { entity: EntityConfig }) => {
    const shade = entity.shadeId;
    const shadeColor = RAINBOW_COLORS[shade];
    const schemaKeys = Object.keys(entity.info.schema);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        {schemaKeys.map((fieldName) => (
                            <th
                                key={fieldName}
                                className="px-4 py-3 text-left text-xs uppercase tracking-wider font-semibold text-white/80 border-b-2"
                                style={{
                                    borderColor: shadeColor.fill,
                                    backgroundColor: `${shadeColor.fill}20`,
                                }}
                            >
                                {fieldName}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entity.info.rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            style={{
                                backgroundColor: rowIndex % 2 === 0 ? "transparent" : `${shadeColor.fill}10`,
                            }}
                        >
                            {row.map((value, colIndex) => (
                                <td key={colIndex} className="px-4 py-3 text-sm text-white/90">
                                    {value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
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
                    <RainbowIdentityCardHead entity={entity} />
                    <RainbowIdentityCardTable entity={entity} />
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
