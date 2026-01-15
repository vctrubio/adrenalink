"use client";

import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";
import { BrandSizeCategoryBadge } from "@/src/components/ui/badge/brand-size-category";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import Link from "next/link";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";

const TEACHER_STATUS_CONFIG = {
    active: { label: "Active", color: "#22c55e" },
    inactive: { label: "Inactive", color: "#6b7280" },
};

export function TeacherEquipmentsClient() {
    const { data: teacherUser } = useTeacherUser();

    const equipmentRelations = teacherUser.equipment || [];
    const activeCount = equipmentRelations.filter((item) => item.active).length;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Equipment</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {equipmentRelations.length} {equipmentRelations.length === 1 ? "item" : "items"} total
                        {activeCount > 0 && (
                            <span className="ml-2">
                                • <span className="text-green-600 dark:text-green-400">{activeCount} active</span>
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Equipment List */}
            {equipmentRelations.length === 0 ? (
                <div className="p-12 rounded-xl border border-border bg-card text-center">
                    <p className="text-muted-foreground text-lg">No equipment assigned</p>
                    <p className="text-sm text-muted-foreground mt-2">Equipment assigned to you will appear here</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {equipmentRelations.map((item, index) => {
                        const equip = item.equipment;
                        const teacherStatus = item.active ? "active" : "inactive";
                        const teacherStatusConfig = TEACHER_STATUS_CONFIG[teacherStatus];
                        const equipStatus = (equip.status || "rental") as EquipmentStatus;
                        const equipStatusConfig = EQUIPMENT_STATUS_CONFIG[equipStatus];

                        const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equip.category);

                        return (
                            <Link key={item.id || `equipment-${index}`} href={`/equipments/${equip.id}`} className="group block">
                                <div className="p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Section - Main Info */}
                                        <div className="flex-1 min-w-0 space-y-3">
                                            {/* Top Row - Badge and Status */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <BrandSizeCategoryBadge
                                                    id={equip.id}
                                                    model={equip.model}
                                                    size={equip.size}
                                                    categoryId={equip.category}
                                                />
                                                <span
                                                    className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        backgroundColor: `${teacherStatusConfig.color}15`,
                                                        color: teacherStatusConfig.color,
                                                    }}
                                                >
                                                    {teacherStatusConfig.label}
                                                </span>
                                                {categoryConfig && (
                                                    <span className="text-xs text-muted-foreground font-medium">{categoryConfig.name}</span>
                                                )}
                                            </div>

                                            {/* Details Row */}
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                                <span className="font-semibold text-foreground">{equip.brand}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="font-mono text-xs">{equip.sku}</span>
                                                {equip.color && (
                                                    <>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <span className="capitalize">{equip.color}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Section - Status and ID */}
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span
                                                className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest"
                                                style={{
                                                    backgroundColor: `${equipStatusConfig.color}15`,
                                                    color: equipStatusConfig.color,
                                                }}
                                            >
                                                {equipStatusConfig.label}
                                            </span>
                                            <span className="text-[10px] font-mono text-muted-foreground">{equip.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
