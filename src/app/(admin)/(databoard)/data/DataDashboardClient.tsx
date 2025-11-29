"use client";

import { useRouter } from "next/navigation";
import { ENTITY_DATA } from "@/config/entities";

interface DataDashboardClientProps {
    counts: Record<string, number>;
}

export function DataDashboardClient({ counts }: DataDashboardClientProps) {
    const router = useRouter();

    const entityIds = ["student", "teacher", "booking", "equipment", "schoolPackage"];
    const entities = ENTITY_DATA.filter(entity => entityIds.includes(entity.id));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map(entity => {
                const Icon = entity.icon;
                const count = counts[entity.id] ?? 0;
                return (
                    <button
                        key={entity.id}
                        onClick={() => router.push(entity.link)}
                        className="group flex flex-col justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3"> {/* Icon and Name side-by-side */}
                                <Icon className="w-7 h-7" style={{ color: entity.color }} /> {/* Icon with color */}
                                <h3 className="text-lg font-semibold text-foreground">{entity.name}</h3> {/* Name beside icon */}
                            </div>
                            <span className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
                                {count}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
