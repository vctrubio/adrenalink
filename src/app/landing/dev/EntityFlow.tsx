"use client";

import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";

type EntityFlowProps = {
    entities: string[];
    arrows?: string[];
};

export function EntityFlow({ entities, arrows = [] }: EntityFlowProps) {
    const getEntity = (id: string) => ENTITY_DATA.find((e) => e.id === id);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {entities.map((entityId, index) => {
                const entity = getEntity(entityId);
                if (!entity) return null;

                return (
                    <div key={entityId} className="flex items-center gap-2">
                        <LabelTag icon={entity.icon} name={entity.name} backgroundColor={entity.hoverColor} color={entity.color} link={entity.link} />
                        {index < entities.length - 1 && (
                            <span className="text-muted-foreground text-sm font-medium">
                                {arrows[index] || "→"}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
