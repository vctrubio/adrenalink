import { getSchoolById } from "@/actions/schools-action";
import { getSchoolName } from "@/getters/schools-getter";
import type { SchoolModel } from "@/backend/models/SchoolModel";

interface SchoolPageProps {
    params: { id: string };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
    const { id: username } = await params;
    const result = await getSchoolById(username, true);

    if (!result.success) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">School Not Found</h1>
                <p className="text-muted-foreground">The school with username {username} could not be found.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getSchoolName(result.data.schema)}</h1>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
    );
}
