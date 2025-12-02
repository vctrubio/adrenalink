"use client";

import { useState } from "react";
import type { StudentPackageBookingLessons } from "@/actions/user-action";
import { StudentPortal } from "@/src/portals";

interface StudentPortalClientProps {
    studentId: string;
    schoolId: string;
    initialData: StudentPackageBookingLessons;
}

export function StudentPortalClient({ studentId, schoolId, initialData }: StudentPortalClientProps) {
    const [data, setData] = useState<StudentPackageBookingLessons>(initialData);

    return <StudentPortal studentId={studentId} schoolId={schoolId} data={data} onDataUpdate={setData} />;
}
