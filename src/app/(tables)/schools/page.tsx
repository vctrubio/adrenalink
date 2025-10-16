import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";
import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import type { School } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

export default async function SchoolsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "School")!;
    const borderColor = entity.color.replace("text-", "border-");
    const data: AbstractModel<School>[] | { error: string } = await getSchools();

    if ("error" in data) {
        return <>{data.error}</>;
    }

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All Schools</h2>
                {data.length === 0 ? (
                    <p className="text-muted-foreground">No schools found</p>
                ) : (
                    <div className="space-y-4">
                        {data.map((school) => (
                            <SchoolCard
                                key={school.schema.id}
                                school={school.serialize()}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
