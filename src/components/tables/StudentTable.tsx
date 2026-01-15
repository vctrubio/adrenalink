import { StudentStatusBadge } from "@/src/components/ui/badge";
import { useState, useMemo, memo } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
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
type SortDirection = "asc" | "desc";
type StatusFilter = "All" | "New" | "Available";

function StudentTable({ 
    students, 
    selectedStudentIds, 
    onToggle, 
    capacity, 
    studentStatsMap = {}
}: StudentTableProps) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    
    const studentEntity = ENTITY_DATA.find((e) => e.id === "student");
    const accentColor = studentEntity?.color || "rgb(var(--primary))";
    const selectedCount = selectedStudentIds.length;

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
        let filtered = [...students];

        // Search filter by name and passport
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((schoolStudent) => {
                const s = schoolStudent.student;
                const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
                const passport = s.passport.toLowerCase();
                return fullName.includes(searchLower) || passport.includes(searchLower);
            });
        }

        // Status filter
        filtered = filtered.filter((schoolStudent) => {
            const student = schoolStudent.student;
            const stats = studentStatsMap[student.id];
            if (statusFilter === "New") {
                return !stats || stats.bookingCount === 0;
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

    if (students.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No students available
            </div>
        );
    }

    return (
        <div className="w-full space-y-3">
            {/* Search and Filter Controls */}
            <div className="flex gap-3 items-center">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by name or passport..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-2 py-2 text-sm bg-transparent border-0 border-b border-border rounded-none focus:outline-none focus:border-foreground transition-colors"
                />
                
                {/* Status Toggle - Similar to DateSection */}
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setStatusFilter("All")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors ${
                            statusFilter === "All"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("New")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            statusFilter === "New"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        New
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatusFilter("Available")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            statusFilter === "Available"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Available
                    </button>
                </div>
            </div>

            {/* Modern Header */}
            <div className="grid grid-cols-[1fr_200px_120px] gap-4 border-b border-border/30 bg-muted/30 py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 rounded-t-xl">
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort(sortColumn === "firstName" ? "lastName" : "firstName")}
                >
                    Student
                    {sortColumn === "firstName" || sortColumn === "lastName" ? (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    ) : null}
                </div>
                <div className="flex items-center">Description</div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("status")}
                >
                    Status
                    {sortColumn === "status" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
            </div>

            {/* Modern Rows */}
            <div>
                {filteredStudents.map((schoolStudent) => {
                    const student = schoolStudent.student;
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isDisabled = capacity && !isSelected && selectedStudentIds.length >= capacity;

                    const stats = studentStatsMap[student.id] || { bookingCount: 0, totalEventCount: 0, totalEventDuration: 0 };

                    return (
                        <div
                            key={student.id}
                            onClick={!isDisabled ? () => onToggle(student.id) : undefined}
                            className={`
                                grid grid-cols-[1fr_200px_120px] gap-4 px-6 py-4
                                transition-all duration-200
                                relative group border-b border-border/40
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                ${
                                    isSelected
                                        ? "bg-primary/10"
                                        : "hover:bg-muted/30"
                                }
                            `}
                            style={
                                isSelected
                                    ? {
                                          backgroundColor: `${accentColor}15`,
                                      }
                                    : undefined
                            }
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div
                                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200"
                                    style={{ backgroundColor: accentColor }}
                                />
                            )}

                            {/* Student */}
                            <div className="flex items-center gap-2 relative z-[1]">
                                <div className="font-bold text-sm text-foreground">
                                    {student.firstName} {student.lastName}
                                </div>
                                {isSelected && selectedCount > 1 && (
                                    <span className="text-lg font-semibold" style={{ color: accentColor }}>
                                        {selectedStudentIds.indexOf(student.id) + 1}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            <div className="flex items-center relative z-[1]">
                                <div className="flex flex-col gap-1">
                                    {schoolStudent.description && (
                                        <span className="max-w-[150px] truncate font-medium text-foreground">
                                            {schoolStudent.description}
                                        </span>
                                    )}
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
                            </div>

                            {/* Status */}
                            <div className="flex items-center relative z-[1]">
                                <StudentStatusBadge
                                    bookingCount={stats.bookingCount}
                                    totalEventDuration={stats.totalEventDuration}
                                    allBookingsCompleted={stats.allBookingsCompleted}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
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