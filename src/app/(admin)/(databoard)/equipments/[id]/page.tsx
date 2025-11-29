import { getEntityId } from "@/actions/id-actions";
import { MasterAdminLayout } from "@/src/components/layouts/MasterAdminLayout";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { EquipmentModel } from "@/backend/models";
import { EquipmentLeftColumn } from "./EquipmentLeftColumn";
import { TeachersUsingEquipmentCard } from "@/src/components/cards/TeachersUsingEquipmentCard";
import { EquipmentRepairsCard } from "@/src/components/cards/EquipmentRepairsCard";

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

    return (
        <MasterAdminLayout
            controller={<EquipmentLeftColumn equipment={equipment} />}
            form={
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
