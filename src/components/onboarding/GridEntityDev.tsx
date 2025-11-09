"use client";

import { useState } from "react";
import type { EntityConfig } from "@/config/entities";
import LinkIcon from "@/public/appSvgs/LinkIcon.jsx";
import { DevBackCard } from "./DevBackCard";

interface GridEntityDevProps {
    entityA: EntityConfig;
    entityB: EntityConfig;
    entityC: EntityConfig;
    description: string;
}

export function GridEntityDev({ entityA, entityB, entityC, description }: GridEntityDevProps) {
    const [flippedA, setFlippedA] = useState(false);
    const [flippedB, setFlippedB] = useState(false);
    const [flippedC, setFlippedC] = useState(false);

    if (!entityA || !entityB || !entityC) {
        return null;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 gap-16 max-w-3xl">
                {/* Entity A - top left */}
                <div className="relative h-52">
                    {!flippedA ? (
                        <div onClick={() => setFlippedA(true)} className={`border-4 ${entityA.color} p-8 rounded-xl border-current flex flex-col items-center gap-4 cursor-pointer transition-all hover:scale-105 h-full justify-center bg-slate-800`}>
                            <entityA.icon className={`${entityA.color} w-16 h-16`} size={64} />
                            <h3 className={"text-xl font-bold text-white"}>{entityA.name}</h3>
                        </div>
                    ) : (
                        <DevBackCard entity={entityA} onClick={() => setFlippedA(false)} />
                    )}
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
                <div className="relative h-52">
                    {!flippedB ? (
                        <div onClick={() => setFlippedB(true)} className={`border-4 ${entityB.color} p-8 rounded-xl border-current flex flex-col items-center gap-4 cursor-pointer transition-all hover:scale-105 h-full justify-center bg-slate-800`}>
                            <entityB.icon className={`${entityB.color} w-16 h-16`} size={64} />
                            <h3 className={"text-xl font-bold text-white"}>{entityB.name}</h3>
                        </div>
                    ) : (
                        <DevBackCard entity={entityB} onClick={() => setFlippedB(false)} />
                    )}
                </div>

                {/* Entity C - bottom left */}
                <div className="relative h-52">
                    {!flippedC ? (
                        <div onClick={() => setFlippedC(true)} className={`border-4 ${entityC.color} p-8 rounded-xl border-current flex flex-col items-center gap-4 cursor-pointer transition-all hover:scale-105 h-full justify-center bg-slate-800`}>
                            <entityC.icon className={`${entityC.color} w-16 h-16`} size={64} />
                            <h3 className={"text-xl font-bold text-white"}>{entityC.name}</h3>
                        </div>
                    ) : (
                        <DevBackCard entity={entityC} onClick={() => setFlippedC(false)} />
                    )}
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
