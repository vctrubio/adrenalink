import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";
import PackageCard from "@/src/components/cards/PackageCard";
import { getPackages } from "@/actions/packages-action";
import type { SchoolPackageModel } from "@/backend/models";

export default async function PackagesPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "School Package")!;
    const borderColor = entity.color.replace("text-", "border-");
    const result = await getPackages();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All School Packages</h2>
                {result.data.length === 0 ? (
                    <p className="text-muted-foreground">No packages found</p>
                ) : (
                    <div className="space-y-4">
                        {result.data.map((schoolPackage) => (
                            <PackageCard
                                key={schoolPackage.schema.id}
                                package={schoolPackage}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
