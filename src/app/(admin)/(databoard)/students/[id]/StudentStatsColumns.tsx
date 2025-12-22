"use client";

import type { StudentModel } from "@/backend/models";
import { getStudentStats } from "@/getters/student-stats-getter";
import { DataboardStats } from "@/src/components/databoard/DataboardStats";

export function StudentStatsColumns({ student }: { student: StudentModel }) {
    const stats = getStudentStats(student);

    return <DataboardStats stats={stats} />;
}

