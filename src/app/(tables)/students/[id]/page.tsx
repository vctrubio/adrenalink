import { getStudentById } from "@/actions/students-action";
import { getStudentName } from "@/getters/students-getter";
import StudentClientPage from "./StudentClientPage";
import type { StudentType } from "@/drizzle/schema";
import type { AbstractModel } from "@/backend/models";

interface StudentPageProps {
    params: { id: string };
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id: studentId } = await params;
    const data: AbstractModel<StudentType> | { error: string } = await getStudentById(studentId);

    if ("error" in data) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">Student Not Found</h1>
                <p className="text-muted-foreground">The student with ID {studentId} could not be found.</p>
            </div>
        );
    }

    if (process.env.JSONIFY === "true") {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-8">{getStudentName(data.schema)}</h1>
                <pre className="bg-muted p-4 rounded-lg overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">{getStudentName(data.schema)}</h1>
            <StudentClientPage student={data.serialize()} />
        </div>
    );
}
