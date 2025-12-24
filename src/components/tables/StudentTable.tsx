import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { useState, useMemo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { STATUS_FILTER_OPTIONS, type StatusFilterType } from "@/config/filterOptions";

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

interface StudentTableProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    capacity?: number;
    studentStatsMap?: Record<string, StudentStats>;
}

type SortColumn = "firstName" | "lastName" | "country" | "languages" | "status" | null;

export function StudentTable({
    students,
    selectedStudentIds,
    onToggle,
    capacity,
    studentStatsMap = {}
}: StudentTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>("All");
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");

    // Filter and sort students
    const filteredStudents = useMemo(() => {
        const filtered = students.filter((schoolStudent) => {
            const student = schoolStudent.student;
            const searchLower = search.toLowerCase();

            // Search filter
            const matchesSearch = (
                student.firstName.toLowerCase().includes(searchLower) ||
                student.lastName.toLowerCase().includes(searchLower) ||
                student.passport.toLowerCase().includes(searchLower)
            );

            if (!matchesSearch) return false;

            // Status filter
            const stats = studentStatsMap[student.id];
            if (statusFilter === "New") {
                return !stats || stats.bookingCount === 0;
            } else if (statusFilter === "Ongoing") {
                return stats && stats.bookingCount > 0;
            }

            return true; // "All"
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                let comparison = 0;
                const studentA = a.student;
                const studentB = b.student;
                const statsA = studentStatsMap[studentA.id];
                const statsB = studentStatsMap[studentB.id];

                switch (sortColumn) {
                    case "firstName":
                        comparison = studentA.firstName.localeCompare(studentB.firstName);
                        break;
                    case "lastName":
                        comparison = studentA.lastName.localeCompare(studentB.lastName);
                        break;
                    case "country":
                        comparison = studentA.country.localeCompare(studentB.country);
                        break;
                    case "languages":
                        comparison = (studentA.languages[0] || "").localeCompare(studentB.languages[0] || "");
                        break;
                    case "status":
                        const countA = statsA?.bookingCount || 0;
                        const countB = statsB?.bookingCount || 0;
                        comparison = countA - countB;
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [students, search, sortColumn, sortDirection, statusFilter, studentStatsMap]);

    if (students.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No students available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2 items-center">
                <SearchInput
                    placeholder="Search by name or passport..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    variant="background"
                    entityColor={studentEntity?.color}
                    className="flex-1"
                />
                {studentEntity && (
                    <FilterDropdown
                        label="Status"
                        value={statusFilter}
                        options={STATUS_FILTER_OPTIONS}
                        onChange={(v) => setStatusFilter(v as StatusFilterType)}
                        entityColor={studentEntity.color}
                    />
                )}
            </div>
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
                            sortActive={sortColumn === "country"}
                            sortDirection={sortDirection}
                            onSort={() => handleSort("country")}
                        >
                            Country
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
                {filteredStudents.map((schoolStudent, index) => {
                    const student = schoolStudent.student;
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isDisabled = capacity && !isSelected && selectedStudentIds.length >= capacity;

                    const stats = studentStatsMap[student.id] || { bookingCount: 0, durationHours: 0 };

                    return (
                        <TableRow
                            key={student.id}
                            onClick={!isDisabled ? () => onToggle(student.id) : undefined}
                            isSelected={isSelected}
                            selectedColor={studentEntity?.color}
                            className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            <TableCell className="font-medium text-foreground">
                                <div>
                                    <div>{student.firstName} {student.lastName}</div>
                                    <div className="text-xs text-muted-foreground">{student.passport}</div>
                                </div>
                            </TableCell>
                            <TableCell>{student.country}</TableCell>
                            <TableCell>{student.languages.join(", ")}</TableCell>
                            <TableCell>
                                <StudentStatusBadge
                                    bookingCount={stats.bookingCount}
                                    durationHours={stats.durationHours}
                                    allBookingsCompleted={stats.allBookingsCompleted}
                                />
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
        </div>
    );
}