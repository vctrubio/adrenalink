import { getEntityId } from "@/actions/id-actions";
import { EntityDetailLayout } from "@/src/components/layouts/EntityDetailLayout";
import { ENTITY_DATA } from "@/config/entities";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { EquipmentModel } from "@/backend/models";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";
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
                <div className="space-y-4">
                    {/* Header */}
                    <div>
                        <div className="flex items-start gap-6 mb-4">
                            <div className="flex-shrink-0" style={{ color: categoryColor }}>
                                <CategoryIcon size={48} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-bold text-foreground">{equipmentName}</h3>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                                    Created {formatDate(equipment.schema.createdAt)}
                                </div>
                            </div>
                        </div>
                        <div className="h-1 w-full rounded-full" style={{ backgroundColor: categoryColor }} />
                    </div>

                    {/* Details */}
                    <div className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">SKU</p>
                                <p className="font-medium text-foreground">{equipment.schema.sku}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <p className="font-medium text-foreground">{equipment.schema.status || "Unknown"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Size</p>
                                <p className="font-medium text-foreground">{equipment.schema.size ? `${equipment.schema.size}m` : "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Color</p>
                                <p className="font-medium text-foreground">{equipment.schema.color || "N/A"}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Category</p>
                            <p className="font-medium text-foreground">{equipment.schema.category}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                            <p className="font-medium text-foreground">{formatDate(equipment.schema.updatedAt)}</p>
                        </div>
                    </div>
                </div>
            }
            rightColumn={
                <>
                    <TeachersUsingEquipmentCard equipment={equipment} />

                    <EquipmentRepairsCard equipment={equipment} />

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
                                <p className="text-2xl font-bold text-foreground">{getPrettyDuration(equipment.stats?.total_duration_minutes || 0)}</p>
                            </div>
                            <div className="border-t border-border pt-4">
                                <p className="text-sm text-muted-foreground">Rentals</p>
                                <p className="text-2xl font-bold text-foreground">{equipment.stats?.rentals_count || 0}</p>
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

                </>
            }
        />
    );
}
