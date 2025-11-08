import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { EquipmentModel } from "@/backend/models";

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
    const EquipmentIcon = equipmentEntity.icon;

    const categoryConfig = EQUIPMENT_CATEGORIES.find((c) => c.id === equipment.schema.category);
    const CategoryIcon = categoryConfig?.icon;
    const categoryColor = categoryConfig?.color || equipmentEntity.color;

    return (
        <EntityDetailLayout
            leftColumn={
                <>
                    {/* Header */}
                    <div className="border-b border-border pb-6">
                        <div className="flex items-start gap-4">
                            <div style={{ color: categoryColor }}>
                                {CategoryIcon ? <CategoryIcon className="w-16 h-16" /> : <EquipmentIcon className="w-16 h-16" />}
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-foreground">{equipment.schema.name}</h1>
                                <p className="text-lg text-muted-foreground mt-2">{equipment.schema.sku}</p>
                                {equipment.schema.color && (
                                    <p className="text-sm text-muted-foreground mt-1">Color: {equipment.schema.color}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Equipment Info Card */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Equipment Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span className="font-medium text-foreground">{equipment.schema.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium text-foreground">{equipment.schema.status || "Active"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium text-foreground">{formatDate(equipment.schema.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-medium text-foreground">{formatDate(equipment.schema.updatedAt)}</span>
                            </div>
                        </div>
                    </div>

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
