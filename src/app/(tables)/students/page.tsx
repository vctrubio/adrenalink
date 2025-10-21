import { ENTITY_DATA } from "@/config/entities";
import LabelTag from "@/src/components/tags/LabelTag";
import StudentCard from "@/src/components/cards/StudentCard";
import { getStudents } from "@/actions/students-action";
import type { StudentModel } from "@/backend/models";

export default async function StudentsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "Student")!;
    const borderColor = entity.color.replace("text-", "border-");
    const result = await getStudents();

    if (!result.success) {
        return <>{result.error}</>;
    }

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All Students</h2>
                {result.data.length === 0 ? (
                    <p className="text-muted-foreground">No students found</p>
                ) : (
                    <div className="space-y-4">
                        {result.data.map((student) => (
                            <StudentCard
                                key={student.schema.id}
                                student={student}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
