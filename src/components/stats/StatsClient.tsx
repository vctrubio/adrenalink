"use client";

import { useState, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { StatsBarChart, type EntityStats } from "./StatsBarChart";
import { EntityFilterPanel } from "./EntityFilterPanel";
import { EntityRelationsView } from "./EntityRelationsView";
import { EntityComparisonView } from "./EntityComparisonView";
import { EntityDetailCard } from "./EntityDetailCard";
import type { BookingModel, StudentModel, TeacherModel, EquipmentModel } from "@/backend/models";

type StatsClientProps = {
    bookings: BookingModel[];
    students: StudentModel[];
    teachers: TeacherModel[];
    equipments: EquipmentModel[];
};

export function StatsClient({ bookings, students, teachers, equipments }: StatsClientProps) {
    const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
    const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);
    const [detailEntity, setDetailEntity] = useState<string | null>(null);

    // Calculate entity stats from data
    const entityStats: EntityStats[] = useMemo(() => {
        const stats: EntityStats[] = [];

        // Count events and lessons from bookings
        let eventCount = 0;
        let lessonCount = 0;
        let paymentCount = 0;

        bookings.forEach((booking) => {
            const lessons = booking.relations?.lessons || [];
            lessonCount += lessons.length;

            lessons.forEach((lesson) => {
                const events = lesson.events || [];
                eventCount += events.length;
            });

            const payments = booking.relations?.studentPayments || [];
            paymentCount += payments.length;
        });

        // Count student packages
        let studentPackageCount = 0;
        students.forEach((student) => {
            const packages = student.relations?.studentPackageStudents || [];
            studentPackageCount += packages.length;
        });

        // Count commissions from teachers
        let commissionCount = 0;
        teachers.forEach((teacher) => {
            const commissions = teacher.relations?.commissions || [];
            commissionCount += commissions.length;
        });

        // Count school packages (from bookings)
        const schoolPackageIds = new Set<string>();
        bookings.forEach((booking) => {
            const packageId = booking.relations?.studentPackage?.schoolPackage?.id;
            if (packageId) schoolPackageIds.add(packageId);
        });

        // Map entity data to stats
        const entityCountMap: Record<string, number> = {
            student: students.length,
            teacher: teachers.length,
            booking: bookings.length,
            equipment: equipments.length,
            event: eventCount,
            lesson: lessonCount,
            studentPackage: studentPackageCount,
            schoolPackage: schoolPackageIds.size,
            commission: commissionCount,
            payment: paymentCount,
        };

        ENTITY_DATA.forEach((entity) => {
            const count = entityCountMap[entity.id] || 0;

            stats.push({
                id: entity.id,
                name: entity.name,
                count,
                color: entity.color,
                bgColor: entity.bgColor,
                icon: entity.icon,
                relations: entity.relations,
            });
        });

        // Filter out entities with 0 count for cleaner visualization
        return stats.filter((s) => s.count > 0);
    }, [bookings, students, teachers, equipments]);

    const handleEntityClick = (entityId: string) => {
        setSelectedEntities((prev) => {
            if (prev.includes(entityId)) {
                return prev.filter((id) => id !== entityId);
            }
            return [...prev, entityId];
        });
    };

    const handleClearAll = () => {
        setSelectedEntities([]);
    };

    const handleEntityHover = (entityId: string | null) => {
        setHighlightedEntity(entityId);
    };

    const handleEntityDoubleClick = (entityId: string) => {
        setDetailEntity(entityId);
    };

    const detailEntityData = entityStats.find((s) => s.id === detailEntity);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Statistics Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of {entityStats.reduce((sum, s) => sum + s.count, 0)} total entities across{" "}
                    {entityStats.length} types
                </p>
            </div>

            {/* Main Bar Chart */}
            <StatsBarChart
                stats={entityStats}
                selectedEntities={selectedEntities}
                highlightedEntity={highlightedEntity}
                onEntityClick={handleEntityClick}
                onEntityHover={handleEntityHover}
            />

            {/* Relations View */}
            <EntityRelationsView stats={entityStats} highlightedEntity={highlightedEntity} />

            {/* Comparison View */}
            <EntityComparisonView stats={entityStats} selectedEntities={selectedEntities} />

            {/* Filter Panel */}
            <EntityFilterPanel
                stats={entityStats}
                selectedEntities={selectedEntities}
                highlightedEntity={highlightedEntity}
                onEntityClick={handleEntityClick}
                onEntityHover={handleEntityHover}
                onClearAll={handleClearAll}
            />

            {/* Detail Card Modal */}
            {detailEntityData && (
                <EntityDetailCard
                    entity={detailEntityData}
                    allStats={entityStats}
                    onClose={() => setDetailEntity(null)}
                />
            )}
        </div>
    );
}
