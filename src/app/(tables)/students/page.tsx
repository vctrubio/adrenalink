import { ENTITY_DATA } from "../../../../config/entities";
import LabelTag from "../../../components/LabelTag";
import EntityCard from "../../../components/EntityCard";
import { getStudents } from "../../../../actions/students-action";
import { getStudentName } from "../../../../getters/students-getter";

export default async function StudentsPage() {
    const entity = ENTITY_DATA.find((e) => e.id === "Student")!;
    const borderColor = entity.color.replace("text-", "border-");
    const studentsResult = await getStudents();
    const students = studentsResult.success ? studentsResult.data : [];

    return (
        <div className="p-8">
            <LabelTag icon={entity.icon} title={`Hello, ${entity.name} Page`} description={entity.description} borderColor={borderColor} textColor={entity.color} />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-foreground mb-4">All Students</h2>
                {students.length === 0 ? (
                    <p className="text-muted-foreground">No students found</p>
                ) : (
                    <div className="space-y-4">
                        {students.map((student) => (
                            <EntityCard
                                key={student.id}
                                id={student.id}
                                title={getStudentName(student)}
                                entityType="students"
                                fields={[
                                    { label: "Passport", value: student.passport },
                                    { label: "Country", value: student.country },
                                    { label: "Phone", value: student.phone },
                                ]}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
