"use client";

import type { School } from "@/drizzle/schema";
import type { SerializedAbstractModel } from "@/backend/models";
import EntityIdCard from "./cards/EntityIdCard";
import SchoolStudentsList from "./SchoolStudentsList";
import AddStudentButton from "./buttons/AddStudentButton";
import AbsModelCard from "./cards/AbsModelCard";

export default function SchoolPageContent({ school }: { school: SerializedAbstractModel<School> }) {
    return (
        <div className="space-y-8">
            <EntityIdCard info={school.schema} />
            <AbsModelCard model={school} />
            <SchoolStudentsList schoolId={school.schema.id} />
            <AddStudentButton schoolUsername={school.schema.username} />
        </div>
    );
}