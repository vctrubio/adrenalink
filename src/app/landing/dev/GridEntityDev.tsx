"use client";

import type { EntityConfig } from "@/config/entities";
import LinkIcon from "@/public/appSvgs/LinkIcon.jsx";

interface GridEntityDevProps {
    entityA: EntityConfig;
    entityB: EntityConfig;
    entityC: EntityConfig;
    description: string;
}

export function GridEntityDev({ entityA, entityB, entityC, description }: GridEntityDevProps) {

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-16 max-w-3xl">
                {/* Entity A - top left */}
                <div className="relative">
                    <div className={`border-4 ${entityA.color} p-8 rounded-xl border-current flex flex-col items-center gap-4`}>
                        <entityA.icon className={`${entityA.color} w-16 h-16`} size={64} />
                        <h3 className={`text-xl font-bold ${entityA.color}`}>{entityA.name}</h3>
                    </div>
                    {/* Arrow pointing right to B */}
                    <div className="absolute top-1/2 -right-12 -translate-y-1/2 z-10">
                        <LinkIcon className="text-muted-foreground" size={32} />
                    </div>
                    {/* Arrow pointing down to C */}
                    <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 z-10">
                        <LinkIcon className="text-muted-foreground rotate-90" size={32} />
                    </div>
                </div>

                {/* Entity B - top right */}
                <div className={`border-4 ${entityB.color} p-8 rounded-xl border-current flex flex-col items-center gap-4`}>
                    <entityB.icon className={`${entityB.color} w-16 h-16`} size={64} />
                    <h3 className={`text-xl font-bold ${entityB.color}`}>{entityB.name}</h3>
                </div>

                {/* Entity C - bottom left */}
                <div className={`border-4 ${entityC.color} p-8 rounded-xl border-current flex flex-col items-center gap-4`}>
                    <entityC.icon className={`${entityC.color} w-16 h-16`} size={64} />
                    <h3 className={`text-xl font-bold ${entityC.color}`}>{entityC.name}</h3>
                </div>

                {/* Description - bottom right, below B */}
                <div className="flex items-center">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <p className="text-base text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
