import { getSchoolById } from "@/actions/schools-action";
import { getSchoolName } from "@/getters/schools-getter";
import SchoolPageContent from "@/src/components/SchoolPageContent";

interface SchoolPageProps {
    params: { id: string };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
    const username = params.id;
    const schoolResult = await getSchoolById(username, true);

    if (!schoolResult.success || !schoolResult.data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">School Not Found</h1>
                <p className="text-muted-foreground">The school with username {username} could not be found.</p>
            </div>
        );
    }

    const school = schoolResult.data;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getSchoolName(school.schema)}</h1>
            <SchoolPageContent school={school.serialize()} />
        </div>
    );
}
