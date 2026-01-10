import { getTeacherId } from "@/supabase/server/teacher-id";
import { EQUIPMENT_STATUS_CONFIG, type EquipmentStatus } from "@/types/status";

export const dynamic = "force-dynamic";

interface EquipmentsPageProps {
    params: Promise<{ id: string }>;
}

export default async function EquipmentPage({ params }: EquipmentPageProps) {
    const { id: teacherId } = await params;

    const result = await getTeacherId(teacherId);

    if (!result.success || !result.data) {
        return (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
                Error: {result.error || "Teacher not found"}
            </div>
        );
    }

    const equipmentRelations = result.data.relations.teacher_equipment || [];

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-4">My Equipment</h2>

            {equipmentRelations.length === 0 ? (
                <p className="text-muted-foreground">No equipment relations found</p>
            ) : (
                <div className="space-y-3">
                    {equipmentRelations.map((item: any) => {
                        const equip = item.equipment;
                        const teacherStatus = item.active ? "active" : "inactive";
                        const teacherStatusConfig = TEACHER_STATUS_CONFIG[teacherStatus];
                        const equipStatus = (equip.status || "rental") as EquipmentStatus;
                        const equipStatusConfig = EQUIPMENT_STATUS_CONFIG[equipStatus];

                        return (
                            <div
                                key={item.id}
                                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-bold text-foreground">{equip.model}</h3>
                                            <span
                                                className="text-xs px-2 py-1 rounded-full font-bold uppercase tracking-tighter"
                                                style={{
                                                    backgroundColor: `${teacherStatusConfig.color}20`,
                                                    color: teacherStatusConfig.color,
                                                }}
                                            >
                                                {teacherStatusConfig.label}
                                            </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>
                                                Category:{" "}
                                                <span className="text-foreground font-medium capitalize">{equip.category}</span>
                                            </p>
                                            {equip.color && (
                                                <p>
                                                    Color: <span className="text-foreground font-medium">{equip.color}</span>
                                                </p>
                                            )}
                                            {equip.size && (
                                                <p>
                                                    Size: <span className="text-foreground font-medium">{equip.size}</span>
                                                </p>
                                            )}
                                            <p>
                                                SKU: <span className="text-foreground font-medium font-mono">{equip.sku}</span>
                                            </p>
                                            <p>
                                                Status:{" "}
                                                <span
                                                    className="font-black uppercase text-[10px] tracking-widest px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor: `${equipStatusConfig.color}15`,
                                                        color: equipStatusConfig.color,
                                                    }}
                                                >
                                                    {equipStatusConfig.label}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground mb-1">Equipment ID</p>
                                        <p className="text-xs font-mono text-foreground">{equip.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
