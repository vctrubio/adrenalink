import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { EquipmentModel } from "@/backend/models";
import { EntityInfoCard } from "@/src/components/cards/EntityInfoCard";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import RepairIcon from "@/public/appSvgs/RepairIcon";

export default async function EquipmentDetailPage({ params }: { params: { id: string } }) {
    const result = await getEntityId("equipment", params.id);

    if (!result.success) {
        return (
            <div className="p-8">
                <div className="text-destructive">Error: {result.error}</div>
            </div>
        );
    }

    const equipment = result.data as EquipmentModel;
    const equipmentEntity = ENTITY_DATA.find((e) => e.id === "equipment")!;

    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const CategoryIcon = categoryConfig?.icon || equipmentEntity.icon;
    const categoryColor = categoryConfig?.color || equipmentEntity.color;

    // Equipment name (model + size)
    const equipmentName = `${equipment.schema.model}${equipment.schema.size ? ` - ${equipment.schema.size}m` : ""}`;

    // Count repairs
    const repairCount = equipment.relations?.equipmentRepairs?.length || 0;

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    <EntityInfoCard
                        entity={{
                            id: equipmentEntity.id,
                            name: equipmentName,
                            icon: CategoryIcon,
                            color: categoryColor,
                            bgColor: categoryConfig?.bgColor || equipmentEntity.bgColor,
                        }}
                        status={`${equipment.schema.sku} • ${equipment.schema.category}`}
                        stats={[
                            {
                                icon: FlagIcon,
                                label: "Events",
                                value: equipment.stats?.events_count || 0,
                                color: "#10b981",
                            },
                            {
                                icon: DurationIcon,
                                label: "Hours",
                                value: getPrettyDuration(equipment.stats?.total_duration_minutes || 0),
                                color: "#f59e0b",
                            },
                            {
                                icon: RepairIcon,
                                label: "Repairs",
                                value: repairCount,
                                color: "#ef4444",
                            },
                        ]}
                        fields={[
                            {
                                label: "SKU",
                                value: equipment.schema.sku,
                            },
                            {
                                label: "Model",
                                value: equipment.schema.model,
                            },
                            {
                                label: "Size",
                                value: equipment.schema.size ? `${equipment.schema.size}m` : "N/A",
                            },
                            {
                                label: "Color",
                                value: equipment.schema.color || "N/A",
                            },
                            {
                                label: "Category",
                                value: equipment.schema.category,
                            },
                            {
                                label: "Status",
                                value: equipment.schema.status || "Unknown",
                            },
                            {
                                label: "Created",
                                value: formatDate(equipment.schema.createdAt),
                            },
                            {
                                label: "Last Updated",
                                value: formatDate(equipment.schema.updatedAt),
                            },
                        ]}
                        accentColor={categoryColor}
                    />

                    {/* Equipment Teachers */}
                    {equipment.relations?.teacherEquipments && equipment.relations.teacherEquipments.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Teachers Using Equipment</h2>
                            <div className="space-y-3">
                                {equipment.relations.teacherEquipments.map((te) => (
                                    <div key={te.id} className="border-l-2 border-primary pl-3">
                                        <p className="font-medium text-foreground text-sm">
                                            {te.teacher ? `${te.teacher.firstName} ${te.teacher.lastName}` : "Unknown"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Hours: {(equipment.stats as any)?.teacherHours?.[te.teacher?.id] || 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipment Repairs */}
                    {equipment.relations?.equipmentRepairs && equipment.relations.equipmentRepairs.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Repairs ({equipment.relations.equipmentRepairs.length})</h2>
                            <div className="space-y-3">
                                {equipment.relations.equipmentRepairs.slice(0, 5).map((repair) => (
                                    <div key={repair.id} className="border-l-2 border-red-500 pl-3">
                                        <p className="text-sm font-medium text-foreground">{repair.description || "Repair"}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            ${repair.price || "0"} - {repair.status || "Pending"}
                                        </p>
                                    </div>
                                ))}
                                {equipment.relations.equipmentRepairs.length > 5 && (
                                    <p className="text-sm text-muted-foreground">+{equipment.relations.equipmentRepairs.length - 5} more repairs</p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            }
            rightColumn={
                <>
                    {/* Stats Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Statistics</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Events</p>
                                <p className="text-2xl font-bold text-foreground">{equipment.stats?.events_count || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Duration</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {getPrettyDuration(equipment.stats?.total_duration_minutes || 0)}
                                </p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Rentals</p>
                                <p className="text-2xl font-bold text-foreground">
                                    {equipment.stats?.rentals_count || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Info */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Financial</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Revenue</p>
                                <p className="text-xl font-bold text-green-600">${equipment.stats?.money_in || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Repairs</p>
                                <p className="text-xl font-bold text-red-600">${equipment.stats?.money_out || 0}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Net Profit</p>
                                <p className="text-xl font-bold" style={{ color: (equipment.stats?.money_in || 0) - (equipment.stats?.money_out || 0) >= 0 ? "#10b981" : "#ef4444" }}>
                                    ${(equipment.stats?.money_in || 0) - (equipment.stats?.money_out || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Repair Status */}
                    {(equipment.relations?.equipmentRepairs || []).some((r) => r.status === "in_repair" || r.status === "pending") && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">In Repair</h2>
                            <p className="text-sm text-red-600 dark:text-red-400">
                                This equipment has pending repairs
                            </p>
                        </div>
                    )}
                </>
            }
        />
    );
}
