import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherTable } from "@/src/components/tables/TeacherTable";

interface Commission {
    id: string;
    commissionType: string;
    cph: string;
    description: string | null;
}

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    languages: string[];
    commissions: Commission[];
}

interface TeacherStats {
    totalLessons: number;
    plannedLessons: number;
}

interface TeacherSectionProps {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    selectedCommission: Commission | null;
    onSelectTeacher: (teacher: Teacher | null) => void;
    onSelectCommission: (commission: Commission | null) => void;
    onAddCommission?: (teacherId: string, commission: Omit<Commission, "id">) => Promise<void>;
    isExpanded: boolean;
    onToggle: () => void;
    teacherStatsMap?: Record<string, TeacherStats>;
}

export function TeacherSection({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    isExpanded,
    onToggle,
    teacherStatsMap
}: TeacherSectionProps) {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");

    const getCommissionDisplay = (commission: Commission) => {
        return commission.commissionType === "fixed"
            ? `${commission.cph} €/h`
            : `${commission.cph} %/h`;
    };

    const title = selectedTeacher && selectedCommission
        ? `${selectedTeacher.firstName} ${selectedTeacher.lastName} • ${getCommissionDisplay(selectedCommission)}`
        : selectedTeacher
        ? `${selectedTeacher.firstName} - Select Commission`
        : "Teacher (Optional)";

    return (
        <Section
            id="teacher-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={teacherEntity?.icon}
            entityColor={teacherEntity?.color}
        >
            <TeacherTable
                teachers={teachers}
                selectedTeacher={selectedTeacher}
                selectedCommission={selectedCommission}
                onSelectTeacher={onSelectTeacher}
                onSelectCommission={onSelectCommission}
                onSectionClose={onToggle}
                teacherStatsMap={teacherStatsMap}
            />
        </Section>
    );
}
