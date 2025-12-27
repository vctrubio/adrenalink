"use client";

import { Row, type StatItem } from "@/src/components/ui/row";
import { RowPopover } from "@/src/components/ui/row/row-popover";
import { ENTITY_DATA } from "@/config/entities";
import { StudentPackageStats, hasRequestedStatus } from "@/getters/student-packages-getter";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import type { StudentPackageModel } from "@/backend/models";

export function calculateStudentPackageGroupStats(packages: StudentPackageModel[]): StatItem[] {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const totalStudents = packages.reduce((sum, pkg) => sum + StudentPackageStats.getStudentCount(pkg), 0);
    const totalEvents = packages.reduce((sum, pkg) => sum + StudentPackageStats.getEventsCount(pkg), 0);
    const totalMinutes = packages.reduce((sum, pkg) => sum + (pkg.stats?.total_duration_minutes || 0), 0);

    const totalMoneyIn = packages.reduce((sum, pkg) => sum + StudentPackageStats.getMoneyIn(pkg), 0);
    const totalMoneyOut = packages.reduce((sum, pkg) => sum + StudentPackageStats.getMoneyOut(pkg), 0);
    const netRevenue = totalMoneyIn - totalMoneyOut;
    const bankColor = netRevenue >= 0 ? "#10b981" : "#ef4444";

    return [
        { icon: <HelmetIcon className="w-5 h-5" />, value: packages.length, color: packageEntity.color },
        { icon: <HelmetIcon className="w-5 h-5" />, value: totalStudents, color: studentEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(totalMinutes), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(netRevenue), color: bankColor },
    ];
}

interface StudentPackageRowProps {
    item: StudentPackageModel;
    isExpanded: boolean;
    onToggle: (id: string) => void;
}

export const StudentPackageRow = ({ item: studentPackage, isExpanded, onToggle }: StudentPackageRowProps) => {
    const packageEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;

    const PackageIconComponent = packageEntity.icon;
    const entityColor = packageEntity.color;
    const iconColor = isExpanded ? entityColor : "#9ca3af";

    const schoolPackage = studentPackage.relations?.schoolPackage;
    const packageDesc = schoolPackage?.description || "No package";
    const isRequested = hasRequestedStatus(studentPackage);
    const requestedBadge = isRequested ? "Requested" : studentPackage.schema.status || "unknown";

    const strItems = [
        { label: "Status", value: requestedBadge },
        { label: "Package", value: packageDesc },
        { label: "Created", value: formatDate(studentPackage.schema.createdAt) },
        { label: "Start Date", value: formatDate(studentPackage.schema.requestedDateStart) },
        { label: "End Date", value: formatDate(studentPackage.schema.requestedDateEnd) },
    ];

    const revenue = StudentPackageStats.getRevenue(studentPackage);
    const bankColor = revenue >= 0 ? "#10b981" : "#ef4444";

    const stats: StatItem[] = [
        { icon: <HelmetIcon className="w-5 h-5" />, value: StudentPackageStats.getStudentCount(studentPackage), color: studentEntity.color },
        { icon: <FlagIcon className="w-5 h-5" />, value: StudentPackageStats.getEventsCount(studentPackage), color: eventEntity.color },
        { icon: <DurationIcon className="w-5 h-5" />, value: getPrettyDuration(studentPackage.stats?.total_duration_minutes || 0), color: "#4b5563" },
        { icon: <BankIcon className="w-5 h-5" />, value: Math.abs(revenue), color: bankColor },
    ];

    const popoverItems = isRequested ? [{ id: studentPackage.schema.id, icon: <RequestIcon className="w-4 h-4" />, color: packageEntity.color, label: "Requested" }] : [];

    return (
        <Row
            id={studentPackage.schema.id}
            entityData={studentPackage.schema}
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
                name: `Package ${studentPackage.schema.id.slice(0, 8)}`,
                status: `Status: ${requestedBadge}`,
            }}
            str={{
                label: "Details",
                items: strItems,
            }}
            action={null}
            popover={<RowPopover items={popoverItems} />}
            stats={stats}
        />
    );
};
