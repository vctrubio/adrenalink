"use client";

import { useMemo } from "react";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import { EquipmentDisplay } from "@/src/app/(admin)/(tables)/equipments/EquipmentsTable";
import { StatItemUI } from "@/backend/data/StatsData";

export function TeacherEquipmentsClient() {
    const { data: teacherUser } = useTeacherUser();

    const equipmentRelations = teacherUser.equipment || [];
    const activeCount = equipmentRelations.filter((item) => item.active).length;

    // Calculate event count and duration for each equipment
    const equipmentStats = useMemo(() => {
        const statsMap = new Map<string, { eventCount: number; totalDurationMinutes: number }>();

        // Iterate through all lesson rows and their events
        for (const lessonRow of teacherUser.lessonRows) {
            for (const event of lessonRow.events) {
                if (event.equipments) {
                    for (const equipment of event.equipments) {
                        const current = statsMap.get(equipment.id) || { eventCount: 0, totalDurationMinutes: 0 };
                        statsMap.set(equipment.id, {
                            eventCount: current.eventCount + 1,
                            totalDurationMinutes: current.totalDurationMinutes + event.duration,
                        });
                    }
                }
            }
        }

        return statsMap;
    }, [teacherUser.lessonRows]);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Equipment</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {equipmentRelations.length} {equipmentRelations.length === 1 ? "item" : "items"} total
                        {activeCount > 0 && (
                            <span className="ml-2">
                                • <span className="text-green-600 dark:text-green-400">{activeCount} active</span>
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Equipment List */}
            {equipmentRelations.length === 0 ? (
                <div className="p-12 rounded-xl border border-border bg-card text-center">
                    <p className="text-muted-foreground text-lg">No equipment assigned</p>
                    <p className="text-sm text-muted-foreground mt-2">Equipment assigned to you will appear here</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {equipmentRelations.map((item) => {
                        const equip = item.equipment;
                        const stats = equipmentStats.get(equip.id) || { eventCount: 0, totalDurationMinutes: 0 };

                        return (
                            <div
                                key={equip.id}
                                className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left Section - Equipment Display */}
                                    <div className="flex-1 min-w-0">
                                        <EquipmentDisplay
                                            equipment={{
                                                id: equip.id,
                                                brand: equip.brand,
                                                model: equip.model,
                                                size: equip.size,
                                                sku: equip.sku,
                                                color: equip.color,
                                                category: equip.category,
                                            }}
                                            variant="full"
                                            iconSize={16}
                                            showSku={true}
                                        />
                                    </div>

                                    {/* Right Section - Stats */}
                                    <div className="flex items-center gap-3 text-xs font-medium shrink-0">
                                        <StatItemUI
                                            type="events"
                                            value={stats.eventCount}
                                            iconColor={true}
                                            hideLabel={true}
                                        />
                                        <StatItemUI
                                            type="duration"
                                            value={stats.totalDurationMinutes}
                                            iconColor={true}
                                            hideLabel={true}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
