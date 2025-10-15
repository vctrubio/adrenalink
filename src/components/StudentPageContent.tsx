"use client";

import type { Student } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import EntityIdCard from "./cards/EntityIdCard";
import StudentSchoolsList from "./StudentSchoolsList";
import AbsModelCard from "./cards/AbsModelCard";

export default function StudentPageContent({ student }: { student: SerializedAbstractModel<Student> }) {
    return (
        <div className="space-y-8">
            <EntityIdCard info={student.schema} />
            <AbsModelCard model={student} />
            <StudentSchoolsList studentId={student.schema.id} />
        </div>
    );
}