import { ENTITY_DATA } from "@/config/entities";
import { AnimatedEntityName } from "./AnimatedEntityName";
import { AnimatedEntityStats } from "./AnimatedEntityStats";
import { EntityIdStats } from "./EntityIdStats";
import type { StatItem } from "@/src/components/ui/row";

interface EntityHeaderRowProps {
    entityId: string;
    entityName?: string;
    stats: StatItem[];
    isLoading?: boolean;
    shouldAnimate?: boolean;
}

export function EntityHeaderRow({ entityId, entityName, stats, isLoading = false, shouldAnimate = true }: EntityHeaderRowProps) {
    const entity = ENTITY_DATA.find((e) => e.id === entityId);
    if (!entity) return null;

    const Icon = entity.icon;
    const displayName = entityName || entity.name;

    return (
        <div className="flex items-center justify-between gap-6">
            {/* Icon + Name - Icon stays mounted server-side, only name animates */}
            <div className="flex items-center gap-4 px-2">
                {/* Icon container - static server component, no re-renders */}
                <div
                    className="w-14 h-14 flex items-center justify-center rounded-full border-2 [&>svg]:w-full [&>svg]:h-full flex-shrink-0 p-2.5"
                    style={{ borderColor: entity.color, color: entity.color }}
                >
                    <Icon />
                </div>

                {/* Name - client component for animation */}
                <AnimatedEntityName name={displayName} isLoading={isLoading} />
            </div>

            {/* Stats - client component for animation */}
            {shouldAnimate ? (
                <AnimatedEntityStats entityId={entityId} stats={stats} isLoading={isLoading} />
            ) : (
                <EntityIdStats stats={stats} />
            )}
        </div>
    );
}
