"use client";

import { useEffect } from "react";
import type { TeacherModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { useDataboardController } from "@/src/components/layouts/DataboardLayout";
import { TeacherLeftColumn } from "./TeacherLeftColumn";
import { TeacherRightColumn } from "./TeacherRightColumn";

interface TeacherDetailWrapperProps {
    teacher: TeacherModel;
    stats: StatItem[];
}

export function TeacherDetailWrapper({ teacher, stats }: TeacherDetailWrapperProps) {
    const controller = useDataboardController();

    useEffect(() => {
        controller.onStatsChange(stats);
    }, [stats, controller.onStatsChange]);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 space-y-6 lg:space-y-0">
            <div className="lg:col-span-4">
                <div className="sticky top-8">
                    <TeacherLeftColumn teacher={teacher} />
                </div>
            </div>
            <div className="lg:col-span-8">
                <TeacherRightColumn teacher={teacher} />
            </div>
        </div>
    );
}
