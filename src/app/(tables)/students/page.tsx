import { EntityCard } from "@/src/components/cards/EntityCard";
import StudentCard from "@/src/components/cards/StudentCard";
import { getStudents } from "@/actions/students-action";
import type { StudentModel } from "@/backend/models";

export default async function StudentsPage() {
    const result = await getStudents();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="p-8 border-b border-border">
                <EntityCard entityId="student" count={result.data.length} />
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-4">
                    {result.data.length === 0 ? (
                        <p className="text-muted-foreground">No students found</p>
                    ) : (
                        result.data.map((student) => (
                            <StudentCard key={student.schema.id} student={student} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
