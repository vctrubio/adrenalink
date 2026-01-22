import type { BookingTableData, EquipmentTableData, PackageTableData, StudentTableData, TeacherTableData } from "@/config/tables";
import type { TransactionEventData } from "@/types/transaction-event";

export const SEARCH_FIELDS_DESCRIPTION = {
    student: ["First Name", "Last Name", "Passport (ID)"],
    teacher: ["Username", "First Name", "Last Name", "ID"],
    booking: ["Leader Student Name", "Teacher Username"],
    schoolPackage: ["Description", "Type", "Category"],
    equipment: ["Brand", "Model", "SKU", "Size"],
    event: ["Students", "Teacher Username"],
    transactionEvent: ["Student Name", "Teacher Username", "Location"],
};

/**
 * Generic search filter helper
 */
export function filterBySearch<T>(items: T[], search: string, getSearchableText: (item: T) => string): T[] {
    if (!search) return items;
    const searchLower = search.toLowerCase();
    return items.filter((item) => getSearchableText(item).toLowerCase().includes(searchLower));
}

/**
 * Filter students by First Name, Last Name, or Passport (ID)
 */
export function filterStudents(students: StudentTableData[], search: string): StudentTableData[] {
    return filterBySearch(students, search, (s) => `${s.firstName} ${s.lastName} ${s.passport}`);
}

/**
 * Filter teachers by Username, First Name, Last Name, or ID
 */
export function filterTeachers(teachers: TeacherTableData[], search: string): TeacherTableData[] {
    return filterBySearch(teachers, search, (t) => `${t.username} ${t.firstName} ${t.lastName} ${t.id}`);
}

/**
 * Filter bookings by Leader Student Name or Teacher Username
 */
export function filterBookings(bookings: BookingTableData[], search: string): BookingTableData[] {
    return filterBySearch(bookings, search, (b) => {
        const studentText = b.booking.leaderStudentName;
        const teacherText = b.lessons.map((l) => l.teacherUsername).join(" ");
        return `${studentText} ${teacherText}`;
    });
}

/**
 * Filter transaction events by Student Name, Teacher Username, or Location
 */
export function filterTransactionEvents(events: TransactionEventData[], search: string): TransactionEventData[] {
    return filterBySearch(events, search, (e) => {
        const studentNames = e.studentNames.join(" ");
        const teacherName = e.teacher.username;
        const location = e.event.location || "";
        return `${studentNames} ${e.leaderStudentName} ${teacherName} ${location}`;
    });
}

/**
 * Filter packages by Description, Type, or Category
 */
export function filterPackages(packages: PackageTableData[], search: string): PackageTableData[] {
    return filterBySearch(packages, search, (p) => `${p.description} ${p.packageType} ${p.categoryEquipment}`);
}

/**
 * Filter equipment by SKU, Brand, Model, or Size
 */
export function filterEquipment(equipments: EquipmentTableData[], search: string): EquipmentTableData[] {
    return filterBySearch(equipments, search, (e) => `${e.sku} ${e.brand} ${e.model} ${e.size || ""}`);
}
