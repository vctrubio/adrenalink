"use client";

import { useEffect } from "react";
import type { StudentModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { StudentLeftColumn } from "./StudentLeftColumn";
import { StudentRightColumn } from "./StudentRightColumn";

interface StudentDetailWrapperProps {
    student: StudentModel;
    stats: StatItem[];
}

export function StudentDetailWrapper({ student, stats }: StudentDetailWrapperProps) {
    const controller = useDataboardController();

    useEffect(() => {
        controller.onStatsChange(stats);
    }, [stats, controller]);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
            <div className="lg:col-span-4">
                <div className="sticky top-8">
                    <StudentLeftColumn student={student} />
                </div>
            </div>
            <div className="lg:col-span-8">
                <StudentRightColumn student={student} />
            </div>
        </div>
    );
}
