"use client";

import type { SerializedAbstractModel } from "@/backend/models";
import type { StudentType } from "@/drizzle/schema";
import IdField from "@/src/components/cards/IdField";
import StudentSchoolsMembership from "@/src/components/lists/StudentSchoolsMembership";
import StudentBookingsPackagesStats from "@/src/components/lists/StudentBookingsPackagesStats";

interface StudentIdPortalViewProps {
    student: SerializedAbstractModel<StudentType>;
}

export default function StudentIdPortalView({ student }: StudentIdPortalViewProps) {
    return (
        <div className="space-y-6">
            <IdField student={student} />
            <StudentSchoolsMembership student={student} />
            <StudentBookingsPackagesStats student={student} />
        </div>
    );
}