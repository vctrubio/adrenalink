import type { StudentModel } from "@/backend/models";

// ============ STUDENT STATS NAMESPACE ============
// Reads from pre-calculated stats in databoard models
// Falls back to relation traversal for non-databoard usage

export const StudentStats = {
    getMoneyIn: (student: StudentModel): number => student.stats?.money_in || 0,
    getMoneyOut: (student: StudentModel): number => student.stats?.money_out || 0,
    getEventsCount: (student: StudentModel): number => student.stats?.events_count || 0,
    getTotalHours: (student: StudentModel): number => (student.stats?.total_duration_minutes || 0) / 60,
    getBookingsCount: (student: StudentModel): number => student.stats?.bookings_count || 0,
    getRequestedPackagesCount: (student: StudentModel): number => student.stats?.requested_packages_count || 0,
    getRevenue: (student: StudentModel): number => StudentStats.getMoneyIn(student) - StudentStats.getMoneyOut(student),
};

// ============ LEGACY RELATION-BASED GETTERS ============
// Used for non-databoard contexts where stats aren't available

export function getStudentName(student: StudentModel | { firstName: string; lastName: string }): string {
    return `${student.firstName} ${student.lastName}`;
}

export function getStudentSchoolCount(student: StudentModel): number {
    return student.relations?.schoolStudents?.length || 0;
}

export function getStudentUnfinishedRequests(student: StudentModel): Array<{ id: string; status: string; schoolPackageId: string }> {
    const studentPackageStudents = student.relations?.studentPackageStudents || [];
    const unfinishedRequests = [];

    for (const sps of studentPackageStudents) {
        const studentPackage = sps.studentPackage;
        if (!studentPackage) continue;

        if (studentPackage.status === "requested") {
            unfinishedRequests.push({
                id: studentPackage.id,
                status: studentPackage.status,
                schoolPackageId: studentPackage.schoolPackageId,
            });
        }
    }

    return unfinishedRequests;
}
