import { EQUIPMENT_CATEGORIES } from "@/config/equipment";

export function EquipmentSection() {
    return (
        <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Equipment Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {EQUIPMENT_CATEGORIES.map((equipment) => {
                    const Icon = equipment.icon;
                    return (
                        <div key={equipment.id} className={`${equipment.bgColor} rounded-xl p-8 transition-all hover:scale-105 cursor-pointer hover:shadow-xl`}>
                            <div className="bg-white/50 dark:bg-black/30 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                                <Icon className={`${equipment.color} w-16 h-16`} size={64} center={true} />
                            </div>
                            <h3 className={`text-center text-xl font-bold ${equipment.color}`}>{equipment.name}</h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
