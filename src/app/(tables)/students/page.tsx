import { ENTITY_DATA } from "../../../../config/entities";
import LabelTag from "../../../components/LabelTag";
import { getStudents } from "../../../../actions/students-action";
import { getStudentName } from "../../../../getters/students-getter";

export default async function StudentsPage() {
  const entity = ENTITY_DATA.find(e => e.id === "Student")!;
  const borderColor = entity.color.replace("text-", "border-");
  const studentsResult = await getStudents();
  const students = studentsResult.success ? studentsResult.data : [];

  return (
    <div className="p-8">
      <LabelTag
        icon={entity.icon}
        title={`Hello, ${entity.name} Page`}
        description={entity.description}
        borderColor={borderColor}
        textColor={entity.color}
      />
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">All Students</h2>
        {students.length === 0 ? (
          <p className="text-muted-foreground">No students found</p>
        ) : (
          <div className="space-y-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-foreground">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">Passport: {student.passport}</p>
                    <p className="text-sm text-muted-foreground">Country: {student.country}</p>
                    <p className="text-sm text-muted-foreground">Phone: {student.phone}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ID: {student.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
