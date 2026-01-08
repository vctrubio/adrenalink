"use client";

import { MasterTable, type ColumnDef, type MobileColumnDef } from "../MasterTable";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { PackageTableData } from "@/config/tables";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import { StatItemUI } from "@/backend/data/StatsData";
import { PackageConfigToggles } from "@/src/components/labels/PackageConfigToggles";

import { filterPackages } from "@/types/searching-entities";
import { useTablesController } from "@/src/app/(admin)/(tables)/layout";

const HEADER_CLASSES = {
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function PackagesTable({ packages = [] }: { packages: PackageTableData[] }) {
    const { search } = useTablesController();
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage")!;

    // Filter packages
    const filteredPackages = filterPackages(packages, search);

    const desktopColumns: ColumnDef<PackageTableData>[] = [
        {
            header: "Type",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {data.packageType}
                </span>
            ),
        },
        {
            header: "Package Profile",
            headerClassName: HEADER_CLASSES.orange,
            render: (data) => (
                <div className="flex items-center gap-3 flex-wrap">
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
                        desc="Total confirmed bookings"
                    />
                    <StatItemUI 
                        type="requests" 
                        value={data.usageStats.requestCount} 
                        iconColor={true} 
                        desc="Pending package requests"
                    />
                    <StatItemUI 
                        type="revenue" 
                        value={data.usageStats.revenue.toFixed(0)} 
                        iconColor={true} 
                        desc="Revenue from confirmed bookings"
                    />
                </div>
            ),
        },
        {
            header: "Config",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <PackageConfigToggles 
                        packageId={data.id} 
                        isActive={data.active} 
                        isPublic={data.isPublic} 
                    />
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
            label: "Activity",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex flex-row flex-wrap gap-2 scale-90 origin-right justify-end max-w-[120px]">
                    <StatItemUI type="bookings" value={data.usageStats.bookingCount} iconColor={true} />
                    <StatItemUI type="requests" value={data.usageStats.requestCount} iconColor={true} />
                    <StatItemUI type="revenue" value={data.usageStats.revenue.toFixed(0)} iconColor={true} />
                </div>
            ),
        },
        {
            label: "Config",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-end scale-90 origin-right">
                    <PackageConfigToggles 
                        packageId={data.id} 
                        isActive={data.active} 
                        isPublic={data.isPublic} 
                    />
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={filteredPackages}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy="all"
            showGroupToggle={false}
        />
    );
}