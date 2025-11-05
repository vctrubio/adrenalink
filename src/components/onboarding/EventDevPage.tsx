"use client";

import { ENTITY_DATA } from "@/config/entities";
import { GridEntityDev } from "./GridEntityDev";

const entityEvent = ENTITY_DATA.find((e) => e.id === "event")!;
const entityEquipment = ENTITY_DATA.find((e) => e.id === "equipment")!;
const entityFeedback = ENTITY_DATA.find((e) => e.id === "student_lesson_feedback")!;

export function EventDevPage() {
    return (
        <div>
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <entityEvent.icon className="w-12 h-12" style={{ color: entityEvent.color.replace("text-", "") }} />
                    <h1 className="text-5xl font-bold text-foreground">Daily Operations</h1>
                </div>
                <p className="text-muted-foreground text-lg">Track & Execute</p>
            </div>

            <GridEntityDev entityA={entityEvent} entityB={entityEquipment} entityC={entityFeedback} description="Create events, track your equipment and get teacher confirmation easily." />
        </div>
    );
}
