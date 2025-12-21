"use client";

import type { SchoolPackageModel } from "@/backend/models";

interface PackageDropdownRowProps {
    item: SchoolPackageModel;
}

export const PackageDropdownRow = ({ item }: PackageDropdownRowProps) => {
    return (
        <pre>{JSON.stringify(item, null, 2)}</pre>
    );
};
