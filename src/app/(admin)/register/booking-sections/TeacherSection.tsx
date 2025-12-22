import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherTable } from "@/src/components/tables/TeacherTable";
import { TeacherCommissionBadge } from "@/src/components/ui/badge";

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
    onClose?: () => void;
}

export function TeacherSection({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    isExpanded,
    onToggle,
    teacherStatsMap,
    onClose
}: TeacherSectionProps) {
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");

    const title = selectedTeacher && selectedCommission
        ? (
            <div className="flex items-center gap-2">
                <span>{selectedTeacher.firstName} {selectedTeacher.lastName}</span>
                <TeacherCommissionBadge value={selectedCommission.cph} type={selectedCommission.commissionType} />
            </div>
        )
        : selectedTeacher
        ? `${selectedTeacher.firstName} - Select Commission`
        : "Teacher";

    return (
        <Section
            id="teacher-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={teacherEntity?.icon}
            entityColor={teacherEntity?.color}
            optional={true}
            hasSelection={selectedTeacher !== null}
            onClear={() => {
                onSelectTeacher(null);
                onSelectCommission(null);
            }}
            onOptional={onClose}
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
