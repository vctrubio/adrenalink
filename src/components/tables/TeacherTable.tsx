import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { useState, useMemo, memo, useEffect } from "react";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { STATUS_FILTER_OPTIONS, type StatusFilterType } from "@/config/filterOptions";
import { filterBySearch } from "@/types/searching-entities";
import type { TeacherProvider } from "@/supabase/server/teachers";

interface TeacherStats {
    totalLessons: number;
    completedLessons: number;
}

interface TeacherTableProps {
    teachers: TeacherProvider[];
    selectedTeacher: TeacherProvider | null;
    selectedCommission: any | null;
    onSelectTeacher: (teacher: TeacherProvider | null) => void;
    onSelectCommission: (commission: any | null) => void;
    onSectionClose?: () => void;
    teacherStatsMap?: Record<string, TeacherStats>;
}

type SortColumn = "firstName" | "lastName" | "languages" | "status" | null;

function TeacherTable({ teachers, selectedTeacher, selectedCommission, onSelectTeacher, onSelectCommission, onSectionClose, teacherStatsMap = {} }: TeacherTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    // Filter and sort teachers
    const filteredTeachers = useMemo(() => {
        let filtered = filterBySearch(teachers, search, (teacher) => teacher.schema.username);

        filtered = filtered.filter((teacher) => {
            // Status filter
            const stats = teacherStatsMap[teacher.schema.id];
            if (statusFilter === "New") {
                return !stats || stats.totalLessons === 0;
            } else if (statusFilter === "Ongoing") {
                return stats && stats.totalLessons > 0;
            }

            return true; // "All"
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                let comparison = 0;
                const statsA = teacherStatsMap[a.schema.id];
                const statsB = teacherStatsMap[b.schema.id];

                switch (sortColumn) {
                    case "firstName":
                        comparison = a.schema.first_name.localeCompare(b.schema.first_name);
                        break;
                    case "lastName":
                        comparison = a.schema.last_name.localeCompare(b.schema.last_name);
                        break;
                    case "languages":
                        comparison = (a.schema.languages[0] || "").localeCompare(b.schema.languages[0] || "");
                        break;
                    case "status":
                        const lessonsA = statsA?.totalLessons || 0;
                        const lessonsB = statsB?.totalLessons || 0;
                        comparison = lessonsA - lessonsB;
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [teachers, search, sortColumn, sortDirection, statusFilter, teacherStatsMap]);

    useEffect(() => {
        console.log("[TeacherTable] filter changed:", { teachersCount: teachers.length, filteredCount: filteredTeachers.length, search, statusFilter, sortColumn });
    }, [filteredTeachers.length, search, statusFilter, sortColumn, teachers.length]);

    if (teachers.length === 0) {
        return <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">No teachers available</div>;
    }

    const handleTeacherClick = (teacher: TeacherProvider) => {
        if (selectedTeacher?.schema.id === teacher.schema.id) {
            // Deselect if clicking same teacher
            onSelectTeacher(null);
            onSelectCommission(null);
        } else {
            // Select new teacher
            onSelectTeacher(teacher);
            onSelectCommission(null);
        }
    };

    const handleCommissionSelect = (commission: Commission) => {
        onSelectCommission(commission);
        if (onSectionClose) {
            onSectionClose();
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2 items-center">
                <SearchInput
                    placeholder="Search by username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="background"
                    entityColor={teacherEntity?.color}
                    className="flex-1"
                />
                {teacherEntity && <FilterDropdown label="Status" value={statusFilter} options={STATUS_FILTER_OPTIONS} onChange={(v) => setStatusFilter(v as StatusFilterType)} entityColor={teacherEntity.color} />}
            </div>

            {/* Show selected teacher and commission */}
            {selectedTeacher && selectedCommission && (
                <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold text-foreground">
                                {selectedTeacher.schema.first_name} {selectedTeacher.schema.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                @{selectedTeacher.schema.username} • €{selectedCommission.cph}/h ({selectedCommission.commissionType}){selectedCommission.description && ` - ${selectedCommission.description}`}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                onSelectTeacher(null);
                                onSelectCommission(null);
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/50 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {selectedTeacher ? (
                <div className="grid grid-cols-2 gap-4">
                    {/* Left side: Selected teacher only */}
                    <div>
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHead>Teacher</TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                <TableRow onClick={() => handleTeacherClick(selectedTeacher)} isSelected={true} selectedColor={teacherEntity?.color}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="text-foreground">
                                                {selectedTeacher.schema.first_name} {selectedTeacher.schema.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {teacherEntity && (
                                                    <HoverToEntity entity={teacherEntity} id={selectedTeacher.schema.id}>
                                                        @{selectedTeacher.schema.username}
                                                    </HoverToEntity>
                                                )}
                                                {!teacherEntity && `@${selectedTeacher.schema.username}`}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Right side: Commissions table */}
                    <div>
                        <Table>
                            <TableHeader>
                                <tr>
                                    <TableHead>
                                        <div className="text-green-600 dark:text-green-400">
                                            <HandshakeIcon size={18} />
                                        </div>
                                    </TableHead>
                                    <TableHead>Description</TableHead>
                                </tr>
                            </TableHeader>
                            <TableBody>
                                {selectedTeacher.schema.commissions.length > 0 ? (
                                    selectedTeacher.schema.commissions.map((commission) => {
                                        const isCommissionSelected = selectedCommission?.id === commission.id;
                                        const getCommissionDisplay = (commission: Commission) => {
                                            return commission.commissionType === "fixed" ? `${commission.cph} €/h` : `${commission.cph} %/h`;
                                        };

                                        return (
                                            <TableRow key={commission.id} onClick={() => handleCommissionSelect(commission)} isSelected={isCommissionSelected} selectedColor={commissionEntity?.color}>
                                                <TableCell className="font-medium font-mono">{getCommissionDisplay(commission)}</TableCell>
                                                <TableCell className="text-muted-foreground">{commission.description || "-"}</TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="p-6 text-center text-sm text-muted-foreground">
                                            No commissions available
                                        </td>
                                    </tr>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <tr>
                            <TableHead sortable sortActive={sortColumn === "firstName" || sortColumn === "lastName"} sortDirection={sortDirection} onSort={() => handleSort(sortColumn === "firstName" ? "lastName" : "firstName")}>
                                Name
                            </TableHead>
                            <TableHead sortable sortActive={sortColumn === "languages"} sortDirection={sortDirection} onSort={() => handleSort("languages")}>
                                Languages
                            </TableHead>
                            <TableHead sortable sortActive={sortColumn === "status"} sortDirection={sortDirection} onSort={() => handleSort("status")}>
                                Status
                            </TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {filteredTeachers.map((teacher) => {
                            const stats = teacherStatsMap[teacher.schema.id] || { totalLessons: 0, completedLessons: 0 };
                            return (
                                <TableRow key={teacher.schema.id} onClick={() => handleTeacherClick(teacher)} selectedColor={teacherEntity?.color}>
                                    <TableCell className="font-medium text-foreground">
                                        <div>
                                            <div>
                                                {teacher.schema.first_name} {teacher.schema.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {teacherEntity && (
                                                    <HoverToEntity entity={teacherEntity} id={teacher.schema.id}>
                                                        {teacher.schema.username}
                                                    </HoverToEntity>
                                                )}
                                                {!teacherEntity && teacher.schema.username}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{teacher.schema.languages.join(", ")}</TableCell>
                                    <TableCell>
                                        <TeacherActiveLesson totalLessons={stats.totalLessons} completedLessons={stats.completedLessons} />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

export const MemoTeacherTable = memo(TeacherTable);
