import type { StudentPackageModel } from "@/backend/models";

// ============ STUDENT PACKAGE STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models
// Falls back to relation traversal for non-databoard usage

export const StudentPackageStats = {
    getRevenue: (studentPackage: StudentPackageModel): number => studentPackage.stats?.money_in || 0,
    getExpenses: (studentPackage: StudentPackageModel): number => studentPackage.stats?.money_out || 0,
    getProfit: (studentPackage: StudentPackageModel): number => StudentPackageStats.getRevenue(studentPackage) - StudentPackageStats.getExpenses(studentPackage),
};

// ============ UTILITY FUNCTIONS ============
// Helpers for student package checks and lookups

export function hasRequestedStatus(studentPackage: StudentPackageModel): boolean {
    return studentPackage.schema.status === "requested";
}

export function getPackageDescription(studentPackage: StudentPackageModel): string {
    return studentPackage.relations?.schoolPackage?.description || "No description";
}

export function getStudentNames(studentPackage: StudentPackageModel): string {
    const studentPackageStudents = studentPackage.relations?.studentPackageStudents || [];
    return studentPackageStudents.map(sps => {
        const student = sps.student;
        if (!student) return null;
        return `${student.firstName} ${student.lastName}`;
    }).filter(Boolean).join(", ") || "No students";
}
