import { useMemo } from "react";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import { useClassboardContext } from "@/src/providers/classboard-provider";
import { getAllTransactionEvents } from "@/src/app/(admin)/home/getters";
import type { TransactionEventData } from "@/types/transaction-event";
import { getHMDuration } from "@/getters/duration-getter";
import type { ClassboardData } from "@/backend/classboard/ClassboardModel"; // Import ClassboardData

export interface TeacherViewData {
    teacherId: string;
    teacherUsername: string;
    events: {
        id: string;
        time: string;
        location: string;
        durationFormatted: string;
        leaderStudentName: string;
        studentNames: string[];
    }[];
}

export interface StudentViewData {
    iteration: number;
    bookingId: string;
    dateRange: string;
    packageInfo: {
        categoryEquipment: string;
        capacityEquipment: number;
        durationFormatted: string;
    };
    students: {
        id: string;
        firstName: string;
        lastName: string;
        country: string;
        passport: string;
    }[];
}

export function useClassboardShareExportData() {
    const { bookingsForSelectedDate, globalFlag, selectedDate } = useClassboardContext();
    const credentials = useSchoolCredentials();
    const sharingMode = globalFlag.getSharingMode();

    const adminViewData: TransactionEventData[] = useMemo(() => {
        if (!sharingMode || !bookingsForSelectedDate || !credentials) return [];

        // 1. Get all transaction events for these bookings
        // Note: bookingsForSelectedDate here is ClassboardData[], not BookingData[]
        const allEvents = getAllTransactionEvents(bookingsForSelectedDate, credentials.currency);

        // 2. Filter strictly for the selected date
        return allEvents.filter((e) => e.event.date.startsWith(selectedDate));
    }, [bookingsForSelectedDate, credentials, selectedDate, sharingMode]);

    const adminStats = useMemo(() => {
        if (!sharingMode) return null;
        return adminViewData.reduce(
            (acc, curr) => ({
                totalDuration: acc.totalDuration + curr.event.duration,
                eventCount: acc.eventCount + 1,
                completedCount: acc.completedCount + (curr.event.status === "completed" ? 1 : 0),
                studentCount: acc.studentCount + (curr.booking?.students?.length || 0),
                totalCommissions: acc.totalCommissions + curr.financials.teacherEarnings,
                totalRevenue: acc.totalRevenue + curr.financials.studentRevenue,
                totalProfit: acc.totalProfit + curr.financials.profit,
            }),
            {
                totalDuration: 0,
                eventCount: 0,
                completedCount: 0,
                studentCount: 0,
                totalCommissions: 0,
                totalRevenue: 0,
                totalProfit: 0,
            },
        );
    }, [adminViewData, sharingMode]);

    const studentViewData: StudentViewData[] = useMemo(() => {
        if (!bookingsForSelectedDate) return [];

        // Correctly map ClassboardData to StudentViewData
        return bookingsForSelectedDate.map((bookingData: ClassboardData, index) => ({
            iteration: index + 1,
            bookingId: bookingData.booking.id, // Corrected access
            dateRange: `${bookingData.booking.dateStart} to ${bookingData.booking.dateEnd}`, // Corrected access
            packageInfo: {
                categoryEquipment: bookingData.schoolPackage.categoryEquipment, // Correct access
                capacityEquipment: bookingData.schoolPackage.capacityEquipment, // Correct access
                durationFormatted: getHMDuration(bookingData.schoolPackage.durationMinutes), // Correct access
            },
            students: bookingData.bookingStudents.map((bs) => ({
                id: bs.student.id,
                firstName: bs.student.firstName,
                lastName: bs.student.lastName,
                country: bs.student.country || "",
                passport: bs.student.passport || "",
            })),
        }));
    }, [bookingsForSelectedDate]);

    const teacherViewData: TeacherViewData[] = useMemo(() => {
        const teacherMap = new Map<string, TeacherViewData>();

        adminViewData.forEach((data) => {
            const { teacher, event, booking } = data; // Destructure booking
            if (!teacherMap.has(teacher.id)) {
                teacherMap.set(teacher.id, {
                    teacherId: teacher.id,
                    teacherUsername: teacher.username,
                    events: [],
                });
            }

            const teacherEntry = teacherMap.get(teacher.id)!;
            teacherEntry.events.push({
                id: event.id,
                time: event.date.split("T")[1].substring(0, 5),
                location: event.location,
                durationFormatted: getHMDuration(event.duration),
                leaderStudentName: booking.leaderStudentName, // Access from nested booking
                studentNames: booking.students.map(s => `${s.firstName} ${s.lastName}`), // Access from nested booking
            });
        });

        // Sort events within each teacher by time
        teacherMap.forEach((entry) => {
            entry.events.sort((a, b) => a.time.localeCompare(b.time));
        });

        return Array.from(teacherMap.values()).sort((a, b) => a.teacherUsername.localeCompare(b.teacherUsername));
    }, [adminViewData]);

    return {
        isShareMode: !!sharingMode,
        isAdminView: sharingMode === "admin",
        isStudentView: sharingMode === "student",
        isTeacherView: sharingMode === "teacher",
        schoolName: credentials?.name || "School",
        adminViewData,
        adminStats,
        studentViewData,
        teacherViewData,
    };
}