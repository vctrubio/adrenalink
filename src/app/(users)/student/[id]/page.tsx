import { getStudents } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";

interface StudentPageProps {
    params: Promise<{ id: string }>;
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id: studentId } = await params;

    // Get school from subdomain header
    const schoolHeader = await getSchoolHeader();

    // Fetch student data
    const result = await getStudents();

    if (!result.success) {
        return <div className="p-4 text-destructive">Error loading student data</div>;
    }

    const student = result.data.find((s) => s.schema.id === studentId);

    if (!student) {
        return <div className="p-4 text-destructive">Student not found</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    Hello {student.schema.firstName} {student.schema.lastName}
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
