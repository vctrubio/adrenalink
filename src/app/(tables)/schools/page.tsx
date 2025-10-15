import { ENTITY_DATA } from "../../../../config/entities";
import LabelTag from "../../../components/tags/LabelTag";
import EntityCard from "../../../components/cards/EntityCard";
import { getSchools } from "../../../../actions/schools-action";
import { getSchoolName } from "../../../../getters/schools-getter";

export default async function SchoolsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "School")!;
    const borderColor = entity.color.replace("text-", "border-");
    const schoolsResult = await getSchools();
    const schools = schoolsResult.success ? schoolsResult.data : [];

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All Schools</h2>
                {schools.length === 0 ? (
                    <p className="text-muted-foreground">No schools found</p>
                ) : (
                    <div className="space-y-4">
                        {schools.map((school) => (
                            <EntityCard
                                key={school.schema.id}
                                id={school.schema.id}
                                title={getSchoolName(school.schema)}
                                entityType="schools"
                                username={school.schema.username}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
