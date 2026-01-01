"use client";

import { useMemo } from "react";
import { DataboardTableSection } from "./DataboardTableSection";
import { TeacherSortOrder } from "@/backend/TeacherSortOrder";
import { calculateStudentGroupStats } from "./rows/StudentRow";
import { calculateTeacherGroupStats } from "./rows/TeacherRow";
import { calculateBookingGroupStats } from "./rows/BookingRow";
import { calculateEquipmentGroupStats } from "./rows/EquipmentRow";
import { calculateEventGroupStats } from "./rows/EventRow";
import { calculateSchoolPackageGroupStats } from "./rows/SchoolPackageRow";
import type { StatItem } from "@/src/components/ui/row";

interface DataboardPageClientProps<T extends { id: string }> {
    entityId: string;
    data: T[];
}

const statsMap: Record<string, (data: any[]) => StatItem[]> = {
    student: calculateStudentGroupStats,
    teacher: calculateTeacherGroupStats,
    booking: calculateBookingGroupStats,
    equipment: calculateEquipmentGroupStats,
    event: calculateEventGroupStats,
    schoolPackage: calculateSchoolPackageGroupStats,
};

export function DataboardPageClient<T extends { id: string }>({ entityId, data }: DataboardPageClientProps<T>) {
    const teacherSortOrder = useMemo(() => {
        const sortOrder = new TeacherSortOrder();
        return sortOrder.getOrder();
    }, []);

    const sortedData = useMemo(() => {
        if (entityId !== "teacher" || !teacherSortOrder || teacherSortOrder.length === 0) {
            return data;
        }

        return [...data].sort((a, b) => {
            const aIndex = teacherSortOrder.indexOf((a as any).schema?.id || "");
            const bIndex = teacherSortOrder.indexOf((b as any).schema?.id || "");
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
        });
    }, [data, entityId, teacherSortOrder]);

    const calculateStats = statsMap[entityId];

    if (!calculateStats) {
        return <div>Missing stats for entity: {entityId}</div>;
    }

    return <DataboardTableSection entityId={entityId} data={sortedData as any} calculateStats={calculateStats} />;
}
