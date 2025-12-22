import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { StudentTable } from "@/src/components/tables/StudentTable";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    passport: string;
    country: string;
    languages: string[];
}

interface SchoolStudent {
    id: string;
    studentId: string;
    description: string | null;
    active: boolean;
    rental: boolean;
    createdAt: Date;
    updatedAt: Date;
    student: Student;
}

interface StudentStats {
    bookingCount: number;
    durationHours: number;
    allBookingsCompleted?: boolean;
}

type StudentStatusFilter = "All" | "New" | "Ongoing";

interface Package {
    id: string;
    capacityStudents: number;
}

interface StudentsSectionProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    preSelectedId?: string | null;
    capacity?: number;
    isExpanded: boolean;
    onSectionToggle: () => void;
    studentStatsMap?: Record<string, StudentStats>;
    selectedPackage?: Package | null;
}

export function StudentsSection({
    students,
    selectedStudentIds,
    onToggle,
    capacity,
    isExpanded,
    onSectionToggle,
    studentStatsMap,
    selectedPackage
}: StudentsSectionProps) {
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");

    const selectedStudentNames = selectedStudentIds
        .map(id => students.find(s => s.student.id === id)?.student.firstName)
        .filter(Boolean)
        .join(", ");

    const title = selectedPackage && selectedStudentIds.length > 0
        ? `(${selectedStudentIds.length}/${selectedPackage.capacityStudents}) ${selectedStudentNames}`
        : selectedPackage
        ? `Select Students (${selectedPackage.capacityStudents})`
        : capacity
        ? `Select Students (${selectedStudentIds.length}/${capacity})`
        : selectedStudentIds.length > 0
        ? `(${selectedStudentIds.length}) ${selectedStudentNames}`
        : "Select Students";

    return (
        <Section
            id="students-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onSectionToggle}
            entityIcon={studentEntity?.icon}
            entityColor={studentEntity?.color}
            hasSelection={selectedStudentIds.length > 0}
            onClear={() => {
                selectedStudentIds.forEach(id => onToggle(id));
            }}
        >
            <StudentTable
                students={students}
                selectedStudentIds={selectedStudentIds}
                onToggle={onToggle}
                capacity={capacity}
                studentStatsMap={studentStatsMap}
            />
        </Section>
    );
}
