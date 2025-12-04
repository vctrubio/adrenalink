"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { ENTITY_DATA } from "@/config/entities";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { SCHOOL_PACKAGE_STATUS_CONFIG, type SchoolPackageStatus } from "@/types/status";
import { updateSchoolPackageActive } from "@/actions/packages-action";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import type { SchoolPackageModel } from "@/backend/models";
import type { DropdownItemProps } from "@/src/components/ui/dropdown";

export function calculateSchoolPackageGroupStats(packages: SchoolPackageModel[]): StatItem[] {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const totalStudents = packages.reduce((sum, pkg) => sum + (pkg.stats?.student_count || 0), 0);
    const totalEvents = packages.reduce((sum, pkg) => sum + (pkg.stats?.events_count || 0), 0);
    const totalMinutes = packages.reduce((sum, pkg) => sum + (pkg.stats?.total_duration_minutes || 0), 0);
    const totalRevenue = packages.reduce((sum, pkg) => sum + (pkg.stats?.money_in || 0), 0);

    return [
        { icon: <HelmetIcon className="w-5 h-5" />, value: packages.length, color: packageEntity.color },
        { icon: <HelmetIcon className="w-5 h-5" />, value: totalStudents, color: studentEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: totalRevenue, color: "#10b981" },
    ];
}

interface SchoolPackageRowProps {
    item: SchoolPackageModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

function validateActivity(fromStatus: SchoolPackageStatus, toStatus: SchoolPackageStatus): boolean {
    console.log(`checking validation for status update ${fromStatus} to ${toStatus}`);
    return true;
}

export const SchoolPackageRow = ({ item: schoolPackage, isExpanded, onToggle }: SchoolPackageRowProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const PackageIconComponent = packageEntity.icon;
    const entityColor = packageEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const durationHours = schoolPackage.schema.durationMinutes / 60;
    const pricePerHour = durationHours > 0 ? schoolPackage.schema.pricePerStudent / durationHours : 0;

    const currentStatus = schoolPackage.schema.active ? "active" : "inactive";
    const currentStatusConfig = SCHOOL_PACKAGE_STATUS_CONFIG[currentStatus];

    const statusDropdownItems: DropdownItemProps[] = (["active", "inactive"] as const).map((status) => ({
        id: status,
        label: SCHOOL_PACKAGE_STATUS_CONFIG[status].label,
        icon: () => <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SCHOOL_PACKAGE_STATUS_CONFIG[status].color }} />,
        color: SCHOOL_PACKAGE_STATUS_CONFIG[status].color,
        onClick: async () => {
            if (validateActivity(currentStatus, status)) {
                await updateSchoolPackageActive(schoolPackage.schema.id, status === "active");
            }
        },
    }));

    const strItems = [
        { label: "Status", value: currentStatusConfig.label },
        { label: "Public", value: schoolPackage.schema.isPublic ? "Yes" : "No" },
        { label: "Package Type", value: schoolPackage.schema.packageType || "unknown" },
        { label: "Description", value: schoolPackage.schema.description || "No description" },
        { label: "Price Per Student", value: `$${schoolPackage.schema.pricePerStudent}` },
        { label: "Duration", value: `${durationHours} hours` },
        { label: "Price Per Hour", value: `$${pricePerHour.toFixed(2)}` },
        { label: "Created", value: formatDate(schoolPackage.schema.createdAt) },
    ];

    const revenue = schoolPackage.stats?.money_in || 0;
    const studentCount = schoolPackage.stats?.student_count || 0;
    const eventCount = schoolPackage.stats?.events_count || 0;
    const totalMinutes = schoolPackage.stats?.total_duration_minutes || 0;

    const stats: StatItem[] = [
        { icon: <HelmetIcon className="w-5 h-5" />, value: studentCount, color: studentEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: eventCount, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: revenue, color: "#10b981" },
    ];

    return (
        <Row
            id={schoolPackage.schema.id}
            entityData={schoolPackage.schema}
            entityBgColor={packageEntity.bgColor}
            entityColor={packageEntity.color}
            isExpanded={isExpanded}
            onToggle={onToggle}
            head={{
                avatar: (
                    <div style={{ color: iconColor }}>
                        <PackageIconComponent className="w-10 h-10" />
                    </div>
                ),
                name: (
                    <HoverToEntity entity={packageEntity} id={schoolPackage.schema.id}>
                        {`Package ${schoolPackage.schema.id.slice(0, 8)}`}
                    </HoverToEntity>
                ),
                status: currentStatusConfig.label,
                dropdownItems: statusDropdownItems,
                statusColor: currentStatusConfig.color,
            }}
            str={{
                label: schoolPackage.schema.isPublic ? "Public" : "Internal",
                items: strItems,
            }}
            action={null}
            popover={undefined}
            stats={stats}
        />
    );
};
