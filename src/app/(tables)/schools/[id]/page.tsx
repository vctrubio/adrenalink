import { getSchoolById } from "@/actions/schools-action";
import { getSchoolName } from "@/getters/schools-getter";
import type { School } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

interface SchoolPageProps {
    params: { id: string };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
    const username = params.id;
    const data: AbstractModel<School> | { error: string } = await getSchoolById(username, true);

    if ("error" in data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">School Not Found</h1>
                <p className="text-muted-foreground">The school with username {username} could not be found.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getSchoolName(data.schema)}</h1>
            <pre className="bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
