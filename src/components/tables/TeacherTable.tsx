import { TeacherActiveLesson } from "@/src/components/ui/badge/teacher-active-lesson";
import { CommissionTypeValue } from "@/src/components/ui/badge/commission-type-value";
import { AddCommissionForm } from "@/src/components/ui/AddCommissionDropdown";
import { useState, useMemo, memo, useEffect } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { HoverToEntity } from "@/src/components/ui/HoverToEntity";
import { motion } from "framer-motion";
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
type SortDirection = "asc" | "desc";
type TeacherStatusFilter = "All" | "Free";
type CommissionFilter = "All" | "Fixed" | "%" | "+";

// Reusable Teacher Commission Component
interface TeacherCommissionComponentProps {
    commissions: any[];
    selectedCommission: any | null;
    onSelectCommission: (commission: any) => void;
    teacherId: string;
    currency: string;
    onCommissionAdded?: () => void;
}

export function TeacherCommissionComponent({
    commissions,
    selectedCommission,
    onSelectCommission,
    teacherId,
    currency,
    onCommissionAdded,
}: TeacherCommissionComponentProps) {
    const [commissionFilter, setCommissionFilter] = useState<CommissionFilter>("All");
    const [showAddCommission, setShowAddCommission] = useState(false);
    const [localCommissions, setLocalCommissions] = useState<any[]>(commissions);

    // Sync local commissions when commissions prop changes
    useEffect(() => {
        setLocalCommissions(commissions);
        setCommissionFilter("All");
        setShowAddCommission(false);
    }, [commissions]);

    const handleCommissionCreated = (newCommission: any) => {
        const formattedCommission = {
            id: newCommission.id,
            commissionType: newCommission.commission_type,
            cph: newCommission.cph,
            description: newCommission.description,
        };
        setLocalCommissions([...localCommissions, formattedCommission]);
        onSelectCommission(formattedCommission);
        setShowAddCommission(false);
        if (onCommissionAdded) {
            onCommissionAdded();
        }
    };

    return (
        <div className="space-y-4">
            {/* Commissions Title and Filter Buttons */}
            <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                    Commissions
                </div>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => {
                            setCommissionFilter("All");
                            setShowAddCommission(false);
                        }}
                        className={`px-3 py-2 text-xs font-semibold transition-colors ${
                            commissionFilter === "All"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        All
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setCommissionFilter("Fixed");
                            setShowAddCommission(false);
                        }}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            commissionFilter === "Fixed"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Fixed
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setCommissionFilter("%");
                            setShowAddCommission(false);
                        }}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            commissionFilter === "%"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        %
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowAddCommission(!showAddCommission);
                        }}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            showAddCommission
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Commissions List */}
            {localCommissions.length > 0 && (
                <div>
                    <div className="flex flex-wrap gap-2">
                        {localCommissions
                            .filter((commission) => {
                                if (commissionFilter === "All") return true;
                                if (commissionFilter === "Fixed") return commission.commissionType === "fixed";
                                if (commissionFilter === "%") return commission.commissionType === "percentage";
                                return true;
                            })
                            .map((commission) => (
                                <CommissionTypeValue
                                    key={commission.id}
                                    value={commission.cph}
                                    type={commission.commissionType as "fixed" | "percentage"}
                                    description={commission.description}
                                    isSelected={selectedCommission?.id === commission.id}
                                    onClick={() => onSelectCommission(commission)}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Add Commission Form - Show when "+" is toggled */}
            {showAddCommission && (
                <AddCommissionForm
                    teacherId={teacherId}
                    currency={currency}
                    onAdd={handleCommissionCreated}
                    onCancel={() => setShowAddCommission(false)}
                />
            )}
        </div>
    );
}

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
    const [statusFilter, setStatusFilter] = useState<TeacherStatusFilter>("All");
    const [sortColumn, setSortColumn] = useState<SortColumn>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const credentials = useSchoolCredentials();
    const currency = credentials.currency || "YEN";
    const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher");

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    // Filter and sort teachers
    const filteredTeachers = useMemo(() => {
        let filtered = [...teachers];

        // Search filter by username
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter((teacher) => {
                const username = teacher.schema.username.toLowerCase();
                return username.includes(searchLower);
            });
        }

        // Status filter
        filtered = filtered.filter((teacher) => {
            const stats = teacherStatsMap[teacher.schema.id];
            if (statusFilter === "Free") {
                // Everything that is not ongoing (no lessons or 0 lessons)
                return !stats || stats.totalLessons === 0;
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

    const handleCommissionSelect = (commission: any) => {
        onSelectCommission(commission);
        if (onSectionClose) {
            onSectionClose();
        }
    };


    return (
        <div className="w-full space-y-3">
            {/* Search and Filter Controls */}
            <div className="flex gap-3 items-center">
                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search by username..."
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
                        onClick={() => setStatusFilter("Free")}
                        className={`px-3 py-2 text-xs font-semibold transition-colors border-l border-border ${
                            statusFilter === "Free"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                    >
                        Free
                    </button>
                </div>
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

            {/* Modern Header */}
            <div className="grid grid-cols-[1fr_200px_120px] gap-4 border-b border-border/30 bg-muted/30 py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 rounded-t-xl">
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort(sortColumn === "firstName" ? "lastName" : "firstName")}
                >
                    Name
                    {sortColumn === "firstName" || sortColumn === "lastName" ? (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    ) : null}
                </div>
                <div
                    className="flex items-center cursor-pointer hover:text-foreground transition-colors gap-1.5"
                    onClick={() => handleSort("languages")}
                >
                    Languages
                    {sortColumn === "languages" && (
                        <ChevronDownIcon
                            className={`w-3 h-3 flex-shrink-0 transition-transform ${sortDirection === "asc" ? "" : "rotate-180"}`}
                        />
                    )}
                </div>
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
                {filteredTeachers.flatMap((teacher) => {
                    const stats = teacherStatsMap[teacher.schema.id] || { totalLessons: 0, completedLessons: 0 };
                    const isSelected = selectedTeacher?.schema.id === teacher.schema.id;

                    return [
                        <div
                            key={teacher.schema.id}
                            onClick={() => handleTeacherClick(teacher)}
                            className={`
                                grid grid-cols-[1fr_200px_120px] gap-4 px-6 py-4
                                transition-all duration-200 cursor-pointer
                                relative group border-b border-border/40
                                ${
                                    isSelected
                                        ? "bg-primary/10"
                                        : "hover:bg-muted/30"
                                }
                            `}
                        >
                            {/* Selection Indicator */}
                            {isSelected && (
                                <div
                                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-200 bg-primary"
                                />
                            )}

                            {/* Name */}
                            <div className="flex items-center relative z-[1]">
                                {teacherEntity ? (
                                    <HoverToEntity entity={teacherEntity} id={teacher.schema.id}>
                                        <span className="font-bold text-sm text-foreground">
                                            {teacher.schema.username}
                                        </span>
                                    </HoverToEntity>
                                ) : (
                                    <span className="font-bold text-sm text-foreground">
                                        {teacher.schema.username}
                                    </span>
                                )}
                            </div>

                            {/* Languages */}
                            <div className="flex items-center relative z-[1]">
                                <span className="max-w-[150px] truncate font-medium text-foreground">
                                    {teacher.schema.languages.join(", ")}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center relative z-[1]">
                                <TeacherActiveLesson totalLessons={stats.totalLessons} completedLessons={stats.completedLessons} />
                            </div>
                        </div>,
                        isSelected && (
                            <motion.div
                                key={`${teacher.schema.id}-dropdown`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 bg-muted/20 border-b border-border/40"
                            >
                                <TeacherCommissionComponent
                                    commissions={selectedTeacher.schema.commissions}
                                    selectedCommission={selectedCommission}
                                    onSelectCommission={handleCommissionSelect}
                                    teacherId={selectedTeacher.schema.id}
                                    currency={currency}
                                    onCommissionAdded={onCommissionAdded}
                                />
                            </motion.div>
                        ),
                    ].filter(Boolean);
                })}
            </div>
        </div>
    );
}

export const MemoTeacherTable = memo(TeacherTable);