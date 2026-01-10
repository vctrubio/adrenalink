import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { FilterDropdown } from "@/src/components/ui/FilterDropdown";
import { SearchInput } from "@/src/components/SearchInput";
import { useState, useMemo, memo, useEffect } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { useTableSort } from "@/hooks/useTableSort";
import { filterBySearch } from "@/types/searching-entities";
import ReactCountryFlag from "react-country-flag";
import { COUNTRIES } from "@/config/countries";

const STUDENT_STATUS_FILTERS = ["All", "New", "Ongoing", "Available"] as const;

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
    totalEventCount: number;
    totalEventDuration: number;
    allBookingsCompleted?: boolean;
}

interface StudentTableProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    capacity?: number;
    studentStatsMap?: Record<string, StudentStats>;
}

type SortColumn = "firstName" | "lastName" | "status" | null;
type StatusFilter = "All" | "New" | "Ongoing" | "Available";

function StudentTable({ students, selectedStudentIds, onToggle, capacity, studentStatsMap = {} }: StudentTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const { sortColumn, sortDirection, handleSort } = useTableSort<SortColumn>(null);
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");

    // Filter and sort students
    const filteredStudents = useMemo(() => {
        let filtered = filterBySearch(students, search, (schoolStudent) => {
            const s = schoolStudent.student;
            return `${s.firstName} ${s.lastName} ${s.passport}`;
        });

        filtered = filtered.filter((schoolStudent) => {
            const student = schoolStudent.student;

            // Status filter
            const stats = studentStatsMap[student.id];
            if (statusFilter === "New") {
                return !stats || stats.bookingCount === 0;
            } else if (statusFilter === "Ongoing") {
                return stats && stats.bookingCount > 0;
            } else if (statusFilter === "Available") {
                return stats && stats.allBookingsCompleted === true;
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

    useEffect(() => {
        console.log("[StudentTable] filter changed:", {
            studentsCount: students.length,
            filteredCount: filteredStudents.length,
            search,
            statusFilter,
            sortColumn,
        });
    }, [filteredStudents.length, search, statusFilter, sortColumn, students.length]);

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
                        options={STUDENT_STATUS_FILTERS}
                        onChange={(v) => setStatusFilter(v as StatusFilter)}
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
                            Student Profile
                        </TableHead>
                        <TableHead>Description</TableHead>
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

                        const stats = studentStatsMap[student.id] || { bookingCount: 0, totalEventCount: 0, totalEventDuration: 0 };

                        return (
                            <TableRow
                                key={student.id}
                                onClick={!isDisabled ? () => onToggle(student.id) : undefined}
                                isSelected={isSelected}
                                selectedColor={studentEntity?.color}
                                className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            >
                                <TableCell className="font-medium text-foreground">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="font-bold text-sm">
                                            {student.firstName} {student.lastName}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-tight font-black">
                                            <span>{student.passport}</span>
                                            <span className="opacity-20 text-foreground">|</span>
                                            <div className="flex items-center gap-1">
                                                <ReactCountryFlag
                                                    countryCode={getCountryCode(student.country)}
                                                    svg
                                                    style={{ width: "1.2em", height: "1.2em" }}
                                                />
                                            </div>
                                            <span className="opacity-20 text-foreground">|</span>
                                            <span className="truncate max-w-[200px]">{student.languages.join(", ")}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{schoolStudent.description || "-"}</TableCell>
                                <TableCell>
                                    <StudentStatusBadge
                                        bookingCount={stats.bookingCount}
                                        totalEventDuration={stats.totalEventDuration}
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

export const MemoStudentTable = memo(StudentTable);

function getCountryCode(countryName: string): string {
    const country = COUNTRIES.find(
        (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.label.toLowerCase() === countryName.toLowerCase(),
    );
    return country?.code || "US";
}
