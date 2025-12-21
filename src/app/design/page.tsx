"use client";

import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { ENTITY_DATA } from "@/config/entities";

export default function DesignPage() {
    const entitiesWithIcons = ENTITY_DATA.filter(
        (entity) => entity.icon && ["student", "teacher", "booking"].includes(entity.id)
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-12 text-slate-800 dark:text-slate-100">
                    Design System Icons
                </h1>
                
                <div className="flex justify-center gap-48">

                    {entitiesWithIcons.map((entity) => {
                        const Icon = entity.icon;
                        return (
                            <div
                                key={entity.id}
                                className="flex flex-col items-center justify-center space-y-6"
                            >
                                <div style={{ color: entity.color }}>
                                    <Icon size={120} />
                                </div>
                                <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
                                    {entity.name}
                                </h2>
                            </div>
                        );
                    })}
                </div>

                {/* App Icon Section */}
                <div className="mt-16 flex justify-center gap-12">
                    <div className="flex items-center space-x-4 bg-white p-6 rounded-lg">
                        <div className="text-slate-600 dark:text-slate-300">
                            <AdranlinkIcon size={48} />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground">
                            Adrenalink
                        </h3>
                    </div>

                    <div className="flex items-center space-x-4 bg-white p-6 rounded-lg">
                        <div className="text-slate-600 dark:text-slate-300">
                            <DurationIcon size={48} />
                        </div>
                        <h3 className="text-2xl font-semibold text-foreground">
                            2h 30m
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}