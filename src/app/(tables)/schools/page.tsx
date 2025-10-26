import { EntityCard } from "@/src/components/cards/EntityCard";
import SchoolCard from "@/src/components/cards/SchoolCard";
import { getSchools } from "@/actions/schools-action";

export default async function SchoolsPage() {
    const result = await getSchools();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-8 border-b border-border">
                <EntityCard entityId="school" count={result.data.length} />
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {result.data.map((school) => (
                        <SchoolCard key={school.schema.id} school={school} />
                    ))}
                </div>
            </div>
        </div>
    );
}
