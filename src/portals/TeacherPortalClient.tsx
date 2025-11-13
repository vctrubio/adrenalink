"use client";

import { useState } from "react";
import type { TeacherPackageBookingLessons } from "@/src/actions/user-action";
import { TeacherPortal } from "@/src/portals";

interface TeacherPortalClientProps {
    teacherId: string;
    schoolId: string;
    initialData: TeacherPackageBookingLessons;
}

export function TeacherPortalClient({ teacherId, schoolId, initialData }: TeacherPortalClientProps) {
    const [data, setData] = useState<TeacherPackageBookingLessons>(initialData);

    return <TeacherPortal teacherId={teacherId} schoolId={schoolId} data={data} onDataUpdate={setData} />;
}
