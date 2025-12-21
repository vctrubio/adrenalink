"use client";

import type { TeacherModel } from "@/backend/models";

interface TeacherDropdownRowProps {
    item: TeacherModel;
}

export const TeacherDropdownRow = ({ item }: TeacherDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};
