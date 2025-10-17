import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";
import { getPackages } from "@/actions/packages-action";
import type { SchoolPackageType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

export default async function PackagesPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "School Package")!;
    const borderColor = entity.color.replace("text-", "border-");
    const data: AbstractModel<SchoolPackageType>[] | { error: string } = await getPackages();

    if ("error" in data) {
        return <>{data.error}</>;
    }

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All School Packages</h2>
                {data.length === 0 ? (
                    <p className="text-muted-foreground">No packages found</p>
                ) : (
                    <div className="space-y-4">
                        {data.map((schoolPackage) => (
                            <div key={schoolPackage.schema.id} className="bg-card p-6 rounded-lg border border-border">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                        <p className="text-foreground">{schoolPackage.schema.durationMinutes} minutes</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Price per Student</label>
                                        <p className="text-foreground">${schoolPackage.schema.pricePerStudent}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Student Capacity</label>
                                        <p className="text-foreground">{schoolPackage.schema.capacityStudents}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Equipment Category</label>
                                        <p className="text-foreground">{schoolPackage.schema.categoryEquipment}</p>
                                    </div>
                                </div>
                                {schoolPackage.schema.description && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="text-foreground">{schoolPackage.schema.description}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
