"use client";

import type { StudentModel } from "@/backend/models";

interface StudentDropdownRowProps {
    item: StudentModel;
}

export const StudentDropdownRow = ({ item }: StudentDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};
