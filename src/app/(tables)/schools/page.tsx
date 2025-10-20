import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";
import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";
import type { SchoolType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

export default async function SchoolsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "School")!;
    const borderColor = entity.color.replace("text-", "border-");
    const data: AbstractModel<SchoolType>[] | { error: string } = await getSchools();

    if ("error" in data) {
        return <>{data.error}</>;
    }

    // Manually serialize the data for Next.js 15 compatibility
    const serializedSchools = data.map(school => school.toJSON());

    return (
        <div className="h-screen flex flex-col">
            <div className="p-8 border-b border-border">
                <LabelTag icon={entity.icon} title={`${entity.name} Discovery`} description={entity.description} borderColor={borderColor} textColor={entity.color} />
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {serializedSchools.map((school) => (
                        <SchoolCard
                            key={school.schema.id}
                            school={school}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
