import { getTeacherPackageBookingLessons } from "@/src/actions/user-action";
import { TeacherPortalClient } from "@/src/portals/TeacherPortalClient";

interface PageProps {
    params: {
        id: string;
    };
}

export default async function TeacherPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getTeacherPackageBookingLessons(id);

    if (!result.success || !result.data) {
        return <div className="p-6">No teacher data found</div>;
    }

    const data = result.data;
    const schoolId = data.lessons[0]?.booking?.schoolId || "";

    return <TeacherPortalClient teacherId={id} schoolId={schoolId} initialData={data} />;
}
