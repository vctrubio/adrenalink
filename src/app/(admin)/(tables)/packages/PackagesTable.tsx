"use client";

import { MasterTable, type ColumnDef, type MobileColumnDef, type GroupStats, type GroupingType } from "../MasterTable";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { PackageTableData } from "@/config/tables";
import { StatItemUI } from "@/backend/data/StatsData";
import { PackageConfigToggles } from "@/src/components/labels/PackageConfigToggles";
import { LayoutGrid } from "lucide-react";
import { TableGroupHeader, TableMobileGroupHeader } from "@/src/components/tables/TableGroupHeader";

import { useTableLogic } from "@/src/hooks/useTableLogic";
import { filterPackages } from "@/types/searching-entities";
import { TableActions } from "../MasterTable";
import { AnimatePresence, motion } from "framer-motion";
import { useTablesController } from "../layout";

const HEADER_CLASSES = {
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function PackagesTable({ packages = [] }: { packages: PackageTableData[] }) {
    const { showActions } = useTablesController();
    const packageEntity = ENTITY_DATA.find((e) => e.id === "schoolPackage")!;

    const {
        filteredRows: filteredPackages,
        masterTableGroupBy,
        getGroupKey,
    } = useTableLogic({
        data: packages,
        filterSearch: filterPackages,
        filterStatus: (pkg, status) => {
            if (status === "Lesson") return pkg.packageType === "lessons";
            if (status === "Rental") return pkg.packageType === "rental";
            return true; // "All"
        },
        dateField: "createdAt",
    });

    const calculateStats = (groupRows: PackageTableData[]): GroupStats => {
        return groupRows.reduce(
            (acc, curr) => ({
                packageCount: acc.packageCount + 1,
                totalBookings: acc.totalBookings + curr.usageStats.bookingCount,
                totalRequests: acc.totalRequests + curr.usageStats.requestCount,
                totalRevenue: acc.totalRevenue + curr.usageStats.revenue,
            }),
            { packageCount: 0, totalBookings: 0, totalRequests: 0, totalRevenue: 0 },
        );
    };

    const GroupHeaderStats = ({ stats, hideLabel = false }: { stats: GroupStats; hideLabel?: boolean }) => (
        <>
            <StatItemUI type="package" value={stats.packageCount} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="bookings" value={stats.totalBookings} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="requests" value={stats.totalRequests} hideLabel={hideLabel} iconColor={false} />
            <StatItemUI type="revenue" value={stats.totalRevenue} hideLabel={hideLabel} variant="primary" iconColor={false} />
        </>
    );

    const renderGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} />
        </TableGroupHeader>
    );

    const renderMobileGroupHeader = (title: string, stats: GroupStats, groupBy: GroupingType) => (
        <TableMobileGroupHeader title={title} stats={stats} groupBy={groupBy}>
            <GroupHeaderStats stats={stats} hideLabel />
        </TableMobileGroupHeader>
    );

    const desktopColumns: ColumnDef<PackageTableData>[] = [
        {
            header: "Type",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{data.packageType}</span>
            ),
        },
        {
            header: (
                <div className="flex items-center justify-between w-full pr-2">
                    <span>Package Profile</span>
                    <LayoutGrid className="w-4 h-4 opacity-50" />
                </div>
            ),
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <div className="flex items-center justify-between w-full">
                    <HoverToEntity entity={packageEntity} id={data.id}>
                        <span className="font-bold text-foreground whitespace-nowrap">{data.description}</span>
                    </HoverToEntity>
                    <EquipmentStudentPackagePriceBadge
                        categoryEquipment={data.categoryEquipment}
                        equipmentCapacity={data.capacityEquipment}
                        studentCapacity={data.capacityStudents}
                        packageDurationHours={data.durationMinutes / 60}
                        pricePerHour={data.durationMinutes > 0 ? data.pricePerStudent / (data.durationMinutes / 60) : 0}
                        isRental={data.packageType === "rental"}
                    />
                </div>
            ),
        },
        {
            header: "Activity",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex items-center gap-4">
                    <StatItemUI
                        type="bookings"
                        value={data.usageStats.bookingCount}
                        iconColor={true}
                        hideLabel={true}
                        desc="Total confirmed bookings"
                    />
                    <StatItemUI
                        type="requests"
                        value={data.usageStats.requestCount}
                        iconColor={true}
                        hideLabel={true}
                        desc="Pending package requests"
                    />
                    <StatItemUI
                        type="revenue"
                        value={data.usageStats.revenue}
                        iconColor={true}
                        hideLabel={true}
                        desc="Revenue from confirmed bookings"
                    />
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center min-w-[100px]">
                    <AnimatePresence mode="wait">
                        {showActions ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TableActions id={data.id} type="package" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <PackageConfigToggles packageId={data.id} isActive={data.active} isPublic={data.isPublic} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<PackageTableData>[] = [
        {
            label: "Package",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <HoverToEntity entity={packageEntity} id={data.id}>
                            <span className="font-bold text-sm">{data.description}</span>
                        </HoverToEntity>
                    </div>
                    <div className="scale-90 origin-left">
                        <EquipmentStudentPackagePriceBadge
                            categoryEquipment={data.categoryEquipment}
                            equipmentCapacity={data.capacityEquipment}
                            studentCapacity={data.capacityStudents}
                            packageDurationHours={data.durationMinutes / 60}
                            pricePerHour={data.durationMinutes > 0 ? data.pricePerStudent / (data.durationMinutes / 60) : 0}
                            isRental={data.packageType === "rental"}
                        />
                    </div>
                </div>
            ),
        },
        {
            label: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-end scale-90 origin-right min-w-[100px]">
                    <AnimatePresence mode="wait">
                        {showActions ? (
                            <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <TableActions id={data.id} type="package" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="status"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                            >
                                <PackageConfigToggles packageId={data.id} isActive={data.active} isPublic={data.isPublic} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={filteredPackages}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy={masterTableGroupBy}
            getGroupKey={getGroupKey}
            calculateStats={calculateStats}
            renderGroupHeader={renderGroupHeader}
            renderMobileGroupHeader={renderMobileGroupHeader}
            showGroupToggle={false}
            populateType="package"
        />
    );
}