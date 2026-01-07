"use client";

import { MasterTable, type ColumnDef, type MobileColumnDef } from "../MasterTable";
import { PackageStatusLabel } from "@/src/components/labels/PackageStatusLabel";
import { PackagePublicLabel } from "@/src/components/labels/PackagePublicLabel";
import { EquipmentStudentPackagePriceBadge } from "@/src/components/ui/badge/equipment-student-package-price";
import { ENTITY_DATA } from "@/config/entities";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import type { PackageTableData } from "@/supabase/server/packages";
import BookingIcon from "@/public/appSvgs/BookingIcon";

const HEADER_CLASSES = {
    blue: "px-4 py-3 font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10",
    orange: "px-4 py-3 font-medium text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/10",
    zinc: "px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/10",
    center: "px-4 py-3 font-medium text-center",
} as const;

export function PackagesTable({ packages = [] }: { packages: PackageTableData[] }) {
    const packageEntity = ENTITY_DATA.find(e => e.id === "schoolPackage")!;

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
            header: "Bookings",
            headerClassName: HEADER_CLASSES.blue,
            render: (data) => (
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                    <BookingIcon size={16} className="text-blue-600/40" />
                    <span>{data.usageStats.bookingCount}</span>
                </div>
            ),
        },
        {
            header: "Visibility",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <PackagePublicLabel packageId={data.id} isPublic={data.isPublic} />
                </div>
            ),
        },
        {
            header: "Status",
            headerClassName: HEADER_CLASSES.center,
            render: (data) => (
                <div className="flex justify-center">
                    <PackageStatusLabel packageId={data.id} isActive={data.active} />
                </div>
            ),
        },
    ];

    const mobileColumns: MobileColumnDef<PackageTableData>[] = [
        {
            label: "Package",
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
            label: "Bookings",
            render: (data) => (
                <div className="flex items-center gap-1 text-[10px] font-black text-blue-600">
                    <BookingIcon size={12} />
                    <span>{data.usageStats.bookingCount}</span>
                </div>
            ),
        },
        {
            label: "Status",
            render: (data) => (
                <div className="flex flex-col gap-1 items-end scale-90 origin-right">
                    <PackageStatusLabel packageId={data.id} isActive={data.active} />
                    <PackagePublicLabel packageId={data.id} isPublic={data.isPublic} />
                </div>
            ),
        },
    ];

    return (
        <MasterTable
            rows={packages}
            columns={desktopColumns}
            mobileColumns={mobileColumns}
            groupBy="all"
            showGroupToggle={false}
        />
    );
}