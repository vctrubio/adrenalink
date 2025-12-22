import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { StudentStatusBadge } from "@/src/components/ui/badge";
import { useState, useMemo } from "react";

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

type SortColumn = "firstName" | "lastName" | null;
type SortDirection = "asc" | "desc";

export function StudentTable({
    students,
    selectedStudentIds,
    onToggle,
    capacity,
    studentStatsMap = {}
}: StudentTableProps) {
    const [search, setSearch] = useState("");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Filter and sort students
    const filteredStudents = useMemo(() => {
        let filtered = students.filter((schoolStudent) => {
            const student = schoolStudent.student;
            const searchLower = search.toLowerCase();
            return (
                student.firstName.toLowerCase().includes(searchLower) ||
                student.lastName.toLowerCase().includes(searchLower) ||
                student.passport.toLowerCase().includes(searchLower)
            );
        });

        if (sortColumn) {
            filtered.sort((a, b) => {
                let comparison = 0;
                const studentA = a.student;
                const studentB = b.student;

                switch (sortColumn) {
                    case "firstName":
                        comparison = studentA.firstName.localeCompare(studentB.firstName);
                        break;
                    case "lastName":
                        comparison = studentA.lastName.localeCompare(studentB.lastName);
                        break;
                }
                return sortDirection === "asc" ? comparison : -comparison;
            });
        }

        return filtered;
    }, [students, search, sortColumn, sortDirection]);

    if (students.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No students available
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name or passport..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    type="button"
                    onClick={() => console.log("Filter students:", { search, filteredCount: filteredStudents.length })}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                    Filter
                </button>
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
                        <TableHead>Country</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Status</TableHead>
                    </tr>
                </TableHeader>
            <TableBody>
                {filteredStudents.map((schoolStudent) => {
                    const student = schoolStudent.student;
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isDisabled = capacity && !isSelected && selectedStudentIds.length >= capacity;

                    const stats = studentStatsMap[student.id] || { bookingCount: 0, durationHours: 0 };

                    return (
                        <TableRow
                            key={student.id}
                            onClick={!isDisabled ? () => onToggle(student.id) : undefined}
                            isSelected={isSelected}
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