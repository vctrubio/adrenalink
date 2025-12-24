"use client";

import { Row } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { BookingCreateTag } from "@/src/components/tags";
import { SchoolPackageStats as DataboardSchoolPackageStats } from "@/src/components/databoard/stats";
import { formatDate } from "@/getters/date-getter";
import { PackageDropdownRow } from "./PackageDropdownRow";
import { SCHOOL_PACKAGE_STATUS_CONFIG, type SchoolPackageStatus } from "@/types/status";
import { updateSchoolPackageActive, updateSchoolPackagePublic } from "@/actions/packages-action";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import type { SchoolPackageModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";
import { Globe, Lock } from "lucide-react";
import BookingIcon from "@/public/appSvgs/BookingIcon";

export const calculateSchoolPackageGroupStats = DataboardSchoolPackageStats.getStats;

interface SchoolPackageRowProps {
    item: SchoolPackageModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

function validateActivity(fromStatus: string, toStatus: string): boolean {
    return true;
}

export const SchoolPackageRow = ({ item: schoolPackage, isExpanded, onToggle }: SchoolPackageRowProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

    const PackageIconComponent = packageEntity.icon;
    const entityColor = packageEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const durationHours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? schoolPackage.schema.pricePerStudent / durationHours : 0;

    const currentStatus = schoolPackage.schema.active ? "active" : "inactive";
    const currentStatusConfig = SCHOOL_PACKAGE_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = [
        ...(["active", "inactive"] as const).map((status) => ({
            id: status,
            label: SCHOOL_PACKAGE_STATUS_CONFIG[status].label,
            icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCHOOL_PACKAGE_STATUS_CONFIG[status].color }} />,
            color: SCHOOL_PACKAGE_STATUS_CONFIG[status].color,
            onClick: async () => {
                if (validateActivity(currentStatus, status)) {
                    await updateSchoolPackageActive(schoolPackage.schema.id, status === "active");
                }
            },
        })),
        {
            id: "public",
            label: "Public",
            icon: () => <Globe size={12} />,
            color: "#3b82f6",
            onClick: async () => {
                await updateSchoolPackagePublic(schoolPackage.schema.id, true);
            },
        },
        {
            id: "private",
            label: "Private",
            icon: () => <Lock size={12} />,
            color: "#f97316",
            onClick: async () => {
                await updateSchoolPackagePublic(schoolPackage.schema.id, false);
            },
        },
    ];

    const strItems = [
        { label: "Package Type", value: schoolPackage.schema.packageType || "unknown" },
        { label: "Description", value: schoolPackage.schema.description || "No description" },
        { label: "Price Per Student", value: `$${schoolPackage.schema.pricePerStudent}` },
        { label: "Duration", value: `${durationHours} hours` },
        { label: "Price Per Hour", value: `$${pricePerHour.toFixed(2)}` },
        { label: "Created", value: formatDate(schoolPackage.schema.createdAt) },
        { label: "Access", value: schoolPackage.schema.isPublic ? "Public" : "Private" },
    ];

    const stats = DataboardSchoolPackageStats.getStats(schoolPackage, false);

    return (
        <Row
            id={schoolPackage.schema.id}
            entityData={schoolPackage.schema}
            entityBgColor={packageEntity.bgColor}
            entityColor={packageEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            expandedContent={<PackageDropdownRow item={schoolPackage} />}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <PackageIconComponent className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={packageEntity} id={schoolPackage.schema.id}>
                        {schoolPackage.schema.description || "No description"}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: (
                    <EquipmentStudentPackagePriceBadge 
                        categoryEquipment={schoolPackage.schema.categoryEquipment} 
                        equipmentCapacity={schoolPackage.schema.capacityEquipment} 
                        studentCapacity={schoolPackage.schema.capacityStudents} 
                        packageDurationHours={durationHours}
                        pricePerHour={pricePerHour}
                    />
                ),
                items: strItems,
            }}
            action={
                <BookingCreateTag 
                    icon={<BookingIcon className="w-4 h-4" />} 
                    link={`/register?add=package:${schoolPackage.schema.id}`}
                />
            }
            popover={undefined}
            stats={stats}
        />
    );
};
