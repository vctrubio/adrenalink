import { getStudentById } from "../../../../../actions/students-action";
import { getStudentName, getStudentInfo } from "../../../../../getters/students-getter";
import StudentPageContent from "../../../../components/StudentPageContent";

interface StudentPageProps {
    params: { id: string };
}

export default async function StudentPage({ params }: StudentPageProps) {
    const studentId = params.id;
    const studentResult = await getStudentById(studentId);

    if (!studentResult.success || !studentResult.data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">Student Not Found</h1>
                <p className="text-muted-foreground">The student with ID {studentId} could not be found.</p>
            </div>
        );
    }

    const student = studentResult.data;

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getStudentName(student.schema)}</h1>
            <StudentPageContent student={student.serialize()} />
        </div>
    );
}
