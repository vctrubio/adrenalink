import { getStudentById } from "@/actions/students-action";
import { getStudentName } from "@/getters/students-getter";
import type { StudentModel } from "@/backend/models";

interface StudentPageProps {
    params: { id: string };
}

export default async function StudentPage({ params }: StudentPageProps) {
    const { id } = await params;
    const result = await getStudentById(id);

    if (!result.success) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-foreground mb-4">Student Not Found</h1>
                <p className="text-muted-foreground">The student with ID {id} could not be found.</p>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-8">Student: {getStudentName(result.data.schema)}</h1>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(result.data, null, 2)}</pre>
        </div>
    );
}