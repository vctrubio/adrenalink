export interface TimelineEvent {
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
    commissionType: string;
    commissionCph: number;
    bookingStudents?: { id: string; firstName: string; lastName: string }[] | null;
    equipmentCategory?: string | null;
    capacityEquipment?: number | null;
    capacityStudents?: number | null;
}

export interface TimelineDateGroup {
    date: Date;
    dateLabel: string;
    dayOfWeek: string;
    events: TimelineEvent[];
}

export interface TimelineProps {
    events: TimelineEvent[];
    lessons: any[];
    currency: string;
    formatCurrency: (num: number) => string;
    showTeacher?: boolean;
    showFinancials?: boolean;
}
