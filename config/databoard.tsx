import type { DataboardFilterByDate, DataboardGroupByDate } from "@/types/databoard";
import type { StatItem } from "@/src/components/ui/row";
import type { StudentModel, TeacherModel } from "@/backend/models";
import { getStudentBookingsCount, getStudentEventsCount, getStudentTotalHours, getStudentRequestedPackagesCount, getStudentMoneyIn, getStudentMoneyOut } from "@/getters/students-getter";
import { getTeacherLessonsCount, getTeacherEventsCount, getTeacherTotalHours, getTeacherMoneyEarned } from "@/getters/teachers-getter";
import { ENTITY_DATA } from "@/config/entities";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import RequestIcon from "@/public/appSvgs/RequestIcon";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import BankIcon from "@/public/appSvgs/BankIcon";

export const DATABOARD_DATE_FILTERS: DataboardFilterByDate[] = ["All", "Last 7 days", "Last 30 days"];

export const DATABOARD_DATE_GROUPS: DataboardGroupByDate[] = ["All", "Daily", "Weekly", "Monthly"];

export const DATABOARD_STATS_CONFIG: Record<string, (data: any[]) => StatItem[]> = {
    student: (students: StudentModel[]) => {
        const studentEntity = ENTITY_DATA.find((e) => e.id === "student")!;
        const requestEntity = ENTITY_DATA.find((e) => e.id === "studentPackage")!;
        const bookingEntity = ENTITY_DATA.find((e) => e.id === "booking")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

        const totalRequestedPackages = students.reduce((sum, student) => sum + getStudentRequestedPackagesCount(student), 0);
        const totalBookings = students.reduce((sum, student) => sum + getStudentBookingsCount(student), 0);
        const totalEvents = students.reduce((sum, student) => sum + getStudentEventsCount(student), 0);
        const totalHours = students.reduce((sum, student) => sum + getStudentTotalHours(student), 0);

        const totalMoneyIn = students.reduce((sum, student) => sum + getStudentMoneyIn(student), 0);
        const totalMoneyOut = students.reduce((sum, student) => sum + getStudentMoneyOut(student), 0);
        const netMoney = totalMoneyIn - totalMoneyOut;
        const bankColor = netMoney >= 0 ? "#10b981" : "#ef4444";

        return [
            { icon: <HelmetIcon className="w-5 h-5" />, value: students.length, color: studentEntity.color },
            { icon: <RequestIcon className="w-5 h-5" />, value: totalRequestedPackages, color: requestEntity.color },
            { icon: <BookingIcon className="w-5 h-5" />, value: totalBookings, color: bookingEntity.color },
            { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
            { icon: <DurationIcon className="w-5 h-5" />, value: totalHours, color: "#4b5563" },
            { icon: <BankIcon className="w-5 h-5" />, value: netMoney, color: bankColor },
        ];
    },
    teacher: (teachers: TeacherModel[]) => {
        const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
        const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

        const totalLessons = teachers.reduce((sum, teacher) => sum + getTeacherLessonsCount(teacher), 0);
        const totalEvents = teachers.reduce((sum, teacher) => sum + getTeacherEventsCount(teacher), 0);
        const totalHours = teachers.reduce((sum, teacher) => sum + getTeacherTotalHours(teacher), 0);
        const totalMoneyEarned = teachers.reduce((sum, teacher) => sum + getTeacherMoneyEarned(teacher), 0);

        return [
            { icon: <HeadsetIcon className="w-5 h-5" />, value: teachers.length, color: teacherEntity.color },
            { icon: <LessonIcon className="w-5 h-5" />, value: totalLessons, color: lessonEntity.color },
            { icon: <FlagIcon className="w-5 h-5" />, value: totalEvents, color: eventEntity.color },
            { icon: <DurationIcon className="w-5 h-5" />, value: totalHours, color: "#4b5563" },
            { icon: <BankIcon className="w-5 h-5" />, value: totalMoneyEarned, color: "#10b981" },
        ];
    },
};

export const DATABOARD_ENTITY_SEARCH_FIELDS: Record<string, string[]> = {
    student: ["firstName", "lastName", "phone", "passport"],
    teacher: ["username", "passport", "phone"],
};
