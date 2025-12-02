import { getStudentPackageBookingLessons } from "@/actions/user-action";
import { StudentPortalClient } from "@/src/portals/StudentPortalClient";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function StudentPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getStudentPackageBookingLessons(id);

    if (!result.success || !result.data) {
        return <div className="p-6">No student data found</div>;
    }

    const data = result.data;
    const schoolId = data.lessons[0]?.booking?.schoolId || "";

    return <StudentPortalClient studentId={id} schoolId={schoolId} initialData={data} />;
}
