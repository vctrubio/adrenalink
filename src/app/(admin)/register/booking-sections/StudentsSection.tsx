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

interface StudentsSectionProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    preSelectedId?: string | null;
    capacity?: number;
    isExpanded: boolean;
    onSectionToggle: () => void;
    studentStatsMap?: Record<string, StudentStats>;
}

export function StudentsSection({
    students,
    selectedStudentIds,
    onToggle,
    capacity,
    isExpanded,
    onSectionToggle,
    studentStatsMap
}: StudentsSectionProps) {
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");
    
    const title = capacity
        ? `Select Students (${selectedStudentIds.length}/${capacity})`
        : selectedStudentIds.length > 0
        ? `${selectedStudentIds.length} Student${selectedStudentIds.length !== 1 ? "s" : ""} Selected`
        : "Select Students";

    return (
        <Section
            id="students-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onSectionToggle}
            entityIcon={studentEntity?.icon}
            entityColor={studentEntity?.color}
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
