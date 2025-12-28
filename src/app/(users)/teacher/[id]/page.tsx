import { getTeachers } from "@/actions/teacher-action";
import { getSchoolHeader } from "@/types/headers";

interface TeacherPageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherPage({ params }: TeacherPageProps) {
    const { id: teacherId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();

    // Fetch teacher data
    const result = await getTeachers();

    if (!result.success) {
        return <div className="p-4 text-destructive">Error loading teacher data</div>;
    }

    const teacher = result.data.find((t) => t.schema.id === teacherId);

    if (!teacher) {
        return <div className="p-4 text-destructive">Teacher not found</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    Hello {teacher.schema.firstName} {teacher.schema.lastName}
                </h2>
                {schoolHeader && (
                    <p className="text-xl md:text-2xl text-muted-foreground font-medium">
                        Welcome to {schoolHeader.name}
                    </p>
                )}
            </div>
        </div>
    );
}
