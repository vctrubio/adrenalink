import { EntityCard } from "@/src/components/cards/EntityCard";
import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

function ExportEquipmentAvailable() {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Equipment Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {EQUIPMENT_CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div key={category.id} className="flex flex-col gap-2">
                            <div className={`${category.bgColor}`}>
                                <Icon className={`${category.color} w-full h-auto`} size={120} flag={false} />
                            </div>
                            <div className={`${category.bgColor}`}>
                                <Icon className={`${category.color} w-full h-auto`} size={120} flag={true} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function EquipmentPage() {
    return (
        <>
            <div className="p-8">
                <EntityCard entityId="equipment" />
            </div>
            <ExportEquipmentAvailable />
        </>
    );
}
