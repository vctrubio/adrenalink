import { getSchoolById } from "../../../../../actions/schools-action";
import { getSchoolName, getSchoolInfo } from "../../../../../getters/schools-getter";
import EntityIdCard from "../../../../components/EntityIdCard";

interface SchoolPageProps {
    params: { id: string };
}

export default async function SchoolPage({ params }: SchoolPageProps) {
    const schoolId = params.id;
    const schoolResult = await getSchoolById(schoolId);

    if (!schoolResult.success || !schoolResult.data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">School Not Found</h1>
                <p className="text-muted-foreground">The school with ID {schoolId} could not be found.</p>
            </div>
        );
    }

    const school = schoolResult.data;
    const schoolInfo = getSchoolInfo(school);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getSchoolName(school)}</h1>
            <EntityIdCard info={schoolInfo} />
        </div>
    );
}
