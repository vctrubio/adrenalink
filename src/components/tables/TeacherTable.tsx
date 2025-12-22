import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { TeacherStatusBadge } from "@/src/components/ui/badge";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { useState, useMemo } from "react";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { STATUS_FILTER_OPTIONS, type StatusFilterType } from "@/config/filterOptions";

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

interface TeacherTableProps {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    selectedCommission: Commission | null;
    onSelectTeacher: (teacher: Teacher | null) => void;
    onSelectCommission: (commission: Commission | null) => void;
    onSectionClose?: () => void;
    teacherStatsMap?: Record<string, TeacherStats>;
}

type SortColumn = "firstName" | "lastName" | "languages" | "status" | null;

export function TeacherTable({
    teachers,
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    onSectionClose,
    teacherStatsMap = {}
}: TeacherTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const commissionEntity = ENTITY_DATA.find(e => e.id === "commission");
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");

    // Filter and sort teachers
    const filteredTeachers = useMemo(() => {
        let filtered = teachers.filter((teacher) => {
            const searchLower = search.toLowerCase();

            // Search filter
            const matchesSearch = teacher.username.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // Status filter
            const stats = teacherStatsMap[teacher.id];
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
                const statsA = teacherStatsMap[a.id];
                const statsB = teacherStatsMap[b.id];

                switch (sortColumn) {
                    case "firstName":
                        comparison = a.firstName.localeCompare(b.firstName);
                        break;
                    case "lastName":
                        comparison = a.lastName.localeCompare(b.lastName);
                        break;
                    case "languages":
                        comparison = (a.languages[0] || "").localeCompare(b.languages[0] || "");
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

    if (teachers.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No teachers available
            </div>
        );
    }

    const handleTeacherClick = (teacher: Teacher) => {
        if (selectedTeacher?.id === teacher.id) {
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
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                            <div className="font-semibold text-foreground">
                                {selectedTeacher.firstName} {selectedTeacher.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                @{selectedTeacher.username} • €{selectedCommission.cph}/h ({selectedCommission.commissionType})
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
                                <TableRow
                                    onClick={() => handleTeacherClick(selectedTeacher)}
                                    isSelected={true}
                                    selectedColor={teacherEntity?.color}
                                >
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="text-foreground">
                                                {selectedTeacher.firstName} {selectedTeacher.lastName}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                @{selectedTeacher.username}
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
                                {selectedTeacher.commissions.length > 0 ? (
                                    selectedTeacher.commissions.map((commission) => {
                                        const isCommissionSelected = selectedCommission?.id === commission.id;
                                        const getCommissionDisplay = (commission: Commission) => {
                                            return commission.commissionType === "fixed"
                                                ? `${commission.cph} €/h`
                                                : `${commission.cph} %/h`;
                                        };

                                        return (
                                            <TableRow
                                                key={commission.id}
                                                onClick={() => handleCommissionSelect(commission)}
                                                isSelected={isCommissionSelected}
                                                selectedColor={commissionEntity?.color}
                                            >
                                                <TableCell className="font-medium font-mono">
                                                    {getCommissionDisplay(commission)}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {commission.description || "-"}
                                                </TableCell>
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
                        {filteredTeachers.map((teacher) => {
                            const stats = teacherStatsMap[teacher.id] || { totalLessons: 0, plannedLessons: 0 };
                            return (
                                <TableRow
                                    key={teacher.id}
                                    onClick={() => handleTeacherClick(teacher)}
                                    selectedColor={teacherEntity?.color}
                                >
                                    <TableCell className="font-medium text-foreground">
                                        <div>
                                            <div>{teacher.firstName} {teacher.lastName}</div>
                                            <div className="text-xs text-muted-foreground">{teacher.username}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {teacher.languages.join(", ")}
                                    </TableCell>
                                    <TableCell>
                                        <TeacherStatusBadge totalLessons={stats.totalLessons} plannedLessons={stats.plannedLessons} />
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
