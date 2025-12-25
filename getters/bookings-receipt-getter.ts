interface StudentInfo {
    firstName: string;
    lastName: string;
    passport?: string;
}

interface EventRow {
    eventId: string;
    lessonId: string;
    date: Date;
    time: string;
    dateLabel: string;
    dayOfWeek: string;
    duration: number;
    durationLabel: string;
    location: string;
    teacherId: string;
    teacherName: string;
    teacherUsername: string;
    eventStatus: string;
    lessonStatus: string;
    teacherEarning: number;
    schoolRevenue: number;
    totalRevenue: number;
}

export const formatBookingDate = (date: any): string => {
    if (!date) return "N/A";
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const year = d.getFullYear().toString().slice(-2);
    const ordinal = (n: number) => {
        if (n > 3 && n < 21) return "th";
        switch (n % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    };
    return `${day}${ordinal(day)} ${month} ${year}'`;
};

export function formatBookingReceiptText(
    bookingStartDate: string,
    bookingEndDate: string,
    students: StudentInfo[],
    packageDescription: string,
    packageHours: number,
    packageTypeStr: string,
    studentCapacity: number,
    totalHours: number,
    formatCurrency: (num: number) => string,
    totalRevenue: number,
    pricePerStudent: number,
    eventRows: EventRow[],
): string {
    const today = new Date();
    const todayFormatted = formatBookingDate(today);

    const studentsList = students
        .map((s) => `${s.firstName} ${s.lastName}${s.passport ? ` (${s.passport})` : ""}`)
        .join("\n");

    return `Booking Start Date: ${bookingStartDate}
Booking End Date: ${bookingEndDate}

---

Students:
${studentsList}

---

Package Description: ${packageDescription}
Package Hours: ${packageHours}h
Package Type: ${packageTypeStr}
Student Capacity: (x${studentCapacity})

---

Total Hours: ${totalHours.toFixed(1)}h
Total Price to Pay: ${formatCurrency(totalRevenue)}${studentCapacity > 1 ? `
Total Price per Student: ${formatCurrency(pricePerStudent)}` : ""}
As of Date: ${todayFormatted}

*** RECEIPT ***
${eventRows
        .map((event, idx) => {
            const eventDate = formatBookingDate(event.date);
            return `${idx + 1}. ${event.teacherName}, ${eventDate}, ${event.time}, ${event.durationLabel}, ${event.location} (${event.eventStatus})`;
        })
        .join("\n")}`;
}
