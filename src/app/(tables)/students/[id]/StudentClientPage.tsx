"use client";

import type { StudentType } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import StudentIdPortalView from "@/src/portals/StudentIdPortalView";

interface StudentClientPageProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function StudentClientPage({ student }: StudentClientPageProps) {
    return <StudentIdPortalView student={student} />;
}
