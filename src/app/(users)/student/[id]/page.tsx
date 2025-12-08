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
        <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
                Hello {student.schema.firstName} {student.schema.lastName}
            </h2>
            {schoolHeader && <p className="text-muted-foreground">Welcome to {schoolHeader.name}</p>}
        </div>
    );
}
