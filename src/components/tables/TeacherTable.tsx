import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import { useState } from "react";
import React from "react";
import { ENTITY_DATA } from "@/config/entities";

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

interface TeacherTableProps {
    teachers: Teacher[];
    selectedTeacher: Teacher | null;
    selectedCommission: Commission | null;
    onSelectTeacher: (teacher: Teacher | null) => void;
    onSelectCommission: (commission: Commission | null) => void;
    onSectionClose?: () => void;
}

export function TeacherTable({ 
    teachers, 
    selectedTeacher,
    selectedCommission,
    onSelectTeacher,
    onSelectCommission,
    onSectionClose
}: TeacherTableProps) {
    const [search, setSearch] = useState("");
    const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

    const commissionEntity = ENTITY_DATA.find(e => e.id === "commission");

    // Filter teachers by search term (username)
    const filteredTeachers = teachers.filter((teacher) => {
        const searchLower = search.toLowerCase();
        return teacher.username.toLowerCase().includes(searchLower);
    });

    if (teachers.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                No teachers available
            </div>
        );
    }

    const handleTeacherClick = (teacher: Teacher) => {
        if (expandedTeacherId === teacher.id) {
            // Collapse if already expanded
            setExpandedTeacherId(null);
        } else {
            // Expand and select teacher
            setExpandedTeacherId(teacher.id);
            onSelectTeacher(teacher);
        }
    };

    const handleCommissionSelect = (teacher: Teacher, commission: Commission) => {
        onSelectTeacher(teacher);
        onSelectCommission(commission);
        setExpandedTeacherId(null); // Collapse dropdown
        if (onSectionClose) {
            onSectionClose(); // Close the entire section
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    type="button"
                    onClick={() => console.log("Filter teachers:", { search, filteredCount: filteredTeachers.length })}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                    Filter
                </button>
            </div>

            {/* Show selected teacher and commission */}
            {selectedTeacher && selectedCommission && (
                <div className="p-3 rounded-lg bg-muted border border-border">
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
                                setExpandedTeacherId(null);
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
                        <TableHead sortable>Username</TableHead>
                        <TableHead>Languages</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Commissions</TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filteredTeachers.map((teacher) => {
                        const isExpanded = expandedTeacherId === teacher.id;
                        const isSelected = selectedTeacher?.id === teacher.id;
                        
                        return (
                            <React.Fragment key={teacher.id}>
                                <TableRow
                                    onClick={() => handleTeacherClick(teacher)}
                                    isSelected={isSelected && !isExpanded}
                                >
                                    <TableCell className="font-medium text-foreground">
                                        @{teacher.username}
                                    </TableCell>
                                    <TableCell>{teacher.languages.join(", ")}</TableCell>
                                    <TableCell>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                                            Ready
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {teacher.commissions.length}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                
                                {/* Expanded commission dropdown */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan={4} className="p-0">
                                            <div className="bg-muted/30 border-t border-border">
                                                <div className="p-4 space-y-2">
                                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                                        Select Commission
                                                    </div>
                                                    
                                                    {teacher.commissions.length > 0 ? (
                                                        <>
                                                            {teacher.commissions.map((commission) => {
                                                                const isCommissionSelected = selectedCommission?.id === commission.id;
                                                                
                                                                return (
                                                                    <button
                                                                        key={commission.id}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCommissionSelect(teacher, commission);
                                                                        }}
                                                                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                                                                            isCommissionSelected
                                                                                ? "border-primary bg-primary/10"
                                                                                : "border-border hover:border-primary/50 bg-background"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            {/* Commission Type Icon */}
                                                                            <span 
                                                                                className="text-sm font-bold px-2 py-1 rounded flex items-center justify-center w-8 h-8" 
                                                                                style={{ 
                                                                                    backgroundColor: commissionEntity?.color + "20",
                                                                                    color: commissionEntity?.color 
                                                                                }}
                                                                            >
                                                                                {commission.commissionType === "fixed" ? "€" : "%"}
                                                                            </span>
                                                                            
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-foreground">
                                                                                    €{commission.cph}/hour
                                                                                </div>
                                                                                {commission.description && (
                                                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                                                        {commission.description}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            
                                                                            <div className="text-xs text-muted-foreground capitalize">
                                                                                {commission.commissionType}
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </>
                                                    ) : (
                                                        <div className="text-sm text-muted-foreground text-center py-2">
                                                            No commissions available
                                                        </div>
                                                    )}
                                                    
                                                    {/* Create new commission button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log("Create new commission for teacher:", teacher.id);
                                                        }}
                                                        className="w-full p-3 text-left rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all bg-background"
                                                    >
                                                        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                                                            <span className="text-lg">+</span>
                                                            <span className="text-sm font-medium">Create New Commission</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
