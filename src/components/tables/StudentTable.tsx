import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/src/components/ui/table";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import { useState } from "react";

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

interface StudentTableProps {
    students: SchoolStudent[];
    selectedStudentIds: string[];
    onToggle: (studentId: string) => void;
    capacity?: number;
}

export function StudentTable({ 
    students, 
    selectedStudentIds, 
    onToggle,
    capacity 
}: StudentTableProps) {
    const [search, setSearch] = useState("");

    // Filter students by search term (first name, last name, or passport)
    const filteredStudents = students.filter((schoolStudent) => {
        const student = schoolStudent.student;
        const searchLower = search.toLowerCase();
        return (
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower) ||
            student.passport.toLowerCase().includes(searchLower)
        );
    });

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
                    <TableHead sortable>First Name</TableHead>
                    <TableHead sortable>Last Name</TableHead>
                    <TableHead sortable>Passport</TableHead>
                    <TableHead sortable>Country</TableHead>
                    <TableHead>Languages</TableHead>
                    <TableHead>Status</TableHead>
                </tr>
            </TableHeader>
            <TableBody>
                {filteredStudents.map((schoolStudent) => {
                    const student = schoolStudent.student;
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isDisabled = capacity && !isSelected && selectedStudentIds.length >= capacity;
                    
                    // Calculate status based on bookings
                    // For now showing "New" - we'll add booking stats later
                    const hasBookings = false; // TODO: Get from student relations
                    const bookingCount = 0; // TODO: Count from bookingStudents
                    const totalDurationHours = 0; // TODO: Sum from lessons
                    
                    return (
                        <TableRow
                            key={student.id}
                            onClick={!isDisabled ? () => onToggle(student.id) : undefined}
                            isSelected={isSelected}
                            className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            <TableCell className="font-medium text-foreground">
                                {student.firstName}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                                {student.lastName}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {student.passport}
                            </TableCell>
                            <TableCell>{student.country}</TableCell>
                            <TableCell>{student.languages.join(", ")}</TableCell>
                            <TableCell>
                                {!hasBookings ? (
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium">
                                        New
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs">
                                        <div className="flex items-center gap-1">
                                            <BookingIcon size={14} />
                                            <span>{bookingCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DurationIcon size={14} />
                                            <span>{totalDurationHours}h</span>
                                        </div>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}  
            </TableBody>
        </Table>
        </div>
    );
}