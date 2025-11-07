"use client";

import { RowPopover, type PopoverItem } from "@/src/components/ui/row";
import { getStudentUnfinishedRequests } from "@/getters/students-getter";
import { ENTITY_DATA } from "@/config/entities";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import type { StudentModel } from "@/backend/models";

interface StudentPackagePopoverProps {
    student: StudentModel;
}

export const StudentPackagePopover = ({ student }: StudentPackagePopoverProps) => {
    const unfinishedRequests = getStudentUnfinishedRequests(student);
    const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;

    const popoverItems: PopoverItem[] = unfinishedRequests.map((request) => ({
        id: request.id,
        icon: <RequestIcon className="w-4 h-4" />,
        color: requestEntity.color,
        label: `Request: ${request.id.slice(0, 8)}`,
    }));

    return <RowPopover items={popoverItems} />;
};
