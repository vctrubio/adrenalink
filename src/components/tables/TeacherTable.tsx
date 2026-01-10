import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { AddCommissionDropdown } from "@/src/components/ui/AddCommissionDropdown";
import { useState, useMemo, memo, useEffect } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { STATUS_FILTER_OPTIONS, type StatusFilterType } from "@/config/filterOptions";
import { filterBySearch } from "@/types/searching-entities";
import { motion, AnimatePresence } from "framer-motion";
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
    onCommissionAdded?: () => void;
}

type SortColumn = "firstName" | "lastName" | "languages" | "status" | null;

function TeacherTable({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    onSectionClose,
    teacherStatsMap = {},
    onCommissionAdded,
}: TeacherTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const [localCommissions, setLocalCommissions] = useState<any[]>(selectedTeacher?.schema.commissions || []);
    const credentials = useSchoolCredentials();
    const currency = credentials.currency || "YEN";
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
        console.log("[TeacherTable] filter changed:", {
            teachersCount: teachers.length,
            filteredCount: filteredTeachers.length,
            search,
            statusFilter,
            sortColumn,
        });
    }, [filteredTeachers.length, search, statusFilter, sortColumn, teachers.length]);

    if (teachers.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No teachers available
            </div>
        );
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

    // Sync local commissions when teacher selection changes (fresh data from provider)
    useEffect(() => {
        if (selectedTeacher) {
            setLocalCommissions(selectedTeacher.schema.commissions);
        }
    }, [selectedTeacher]);

    // Handle new commission: show optimistically, then refetch provider data
    const handleCommissionCreated = (newCommission: any) => {
        const formattedCommission = {
            id: newCommission.id,
            commissionType: newCommission.commission_type,
            cph: newCommission.cph,
            description: newCommission.description,
        };
        setLocalCommissions([...localCommissions, formattedCommission]);
        onSelectCommission(formattedCommission);
        // Refetch teacher data from provider to keep parent component in sync
        if (onCommissionAdded) {
            onCommissionAdded();
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
                {teacherEntity && (
                    <FilterDropdown
                        label="Status"
                        value={statusFilter}
                        options={STATUS_FILTER_OPTIONS}
                        onChange={(v) => setStatusFilter(v as StatusFilterType)}
                        entityColor={teacherEntity.color}
                    />
                )}
            </div>

            {/* Show selected teacher and commission */}
            {selectedTeacher && selectedCommission && (
                <div className="p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-semibold text-foreground">{selectedTeacher.schema.username}</div>
                            <div className="text-sm text-muted-foreground">
                                {currency}
                                {selectedCommission.cph}/h ({selectedCommission.commissionType})
                                {selectedCommission.description && ` - ${selectedCommission.description}`}
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

            <Table>
                <TableHeader>
                    <tr>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "firstName" || sortColumn === "lastName"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort(sortColumn === "firstName" ? "lastName" : "firstName")}
                        >
                            Name
                        </TableHead>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "languages"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("languages")}
                        >
                            Languages
                        </TableHead>
                        <TableHead
                            sortable
                            sortActive={sortColumn === "status"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("status")}
                        >
                            Status
                        </TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredTeachers.flatMap((teacher) => {
                        const stats = teacherStatsMap[teacher.schema.id] || { totalLessons: 0, completedLessons: 0 };
                        const isSelected = selectedTeacher?.schema.id === teacher.schema.id;
                        return [
                            <TableRow
                                key={teacher.schema.id}
                                onClick={() => handleTeacherClick(teacher)}
                                isSelected={isSelected}
                                selectedColor={teacherEntity?.color}
                            >
                                <TableCell className="font-medium text-foreground ">
                                    {teacherEntity && (
                                        <HoverToEntity entity={teacherEntity} id={teacher.schema.id}>
                                            {teacher.schema.username}
                                        </HoverToEntity>
                                    )}
                                    {!teacherEntity && teacher.schema.username}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{teacher.schema.languages.join(", ")}</TableCell>
                                <TableCell>
                                    <TeacherActiveLesson totalLessons={stats.totalLessons} completedLessons={stats.completedLessons} />
                                </TableCell>
                            </TableRow>,
                            isSelected && (
                                <motion.tr
                                    key={`${teacher.schema.id}-dropdown`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <td colSpan={3} className="p-4 bg-muted/20">
                                        <div className="space-y-4">
                                            {/* Commissions List */}
                                            {localCommissions.length > 0 && (
                                                <div>
                                                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                                                        Commissions
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {localCommissions.map((commission) => (
                                                            <CommissionTypeValue
                                                                key={commission.id}
                                                                value={commission.cph}
                                                                type={commission.commissionType as "fixed" | "percentage"}
                                                                description={commission.description}
                                                                isSelected={selectedCommission?.id === commission.id}
                                                                onClick={() => handleCommissionSelect(commission)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Add Commission Dropdown */}
                                            <AddCommissionDropdown
                                                teacherId={selectedTeacher.schema.id}
                                                currency={currency}
                                                color={commissionEntity?.color || "#10b981"}
                                                onAdd={handleCommissionCreated}
                                            />
                                        </div>
                                    </td>
                                </motion.tr>
                            ),
                        ].filter(Boolean);
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

export const MemoTeacherTable = memo(TeacherTable);
