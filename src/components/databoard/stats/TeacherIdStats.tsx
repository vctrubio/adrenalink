import type { TeacherModel } from "@/backend/models";
import type { StatItem } from "@/src/components/ui/row";
import { getFullDuration, getPrettyDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import { ENTITY_DATA } from "@/config/entities";
import { TeacherStats as TeacherStatsGetter } from "@/getters/teachers-getter";
import { calculateLessonRevenue } from "@/getters/commission-calculator";
import { transformEventsToRows } from "@/getters/event-getter";
import { TrendingUp, TrendingDown } from "lucide-react";
import LessonIcon from "@/public/appSvgs/LessonIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

export const TeacherIdStats = {
    getStats: (teacher: TeacherModel): StatItem[] => {
        const teacherEntity = ENTITY_DATA.find((e) => e.id === "teacher")!;
        const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
        const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
        const commissionEntity = ENTITY_DATA.find((e) => e.id === "commission");

        const lessons = teacher.relations?.lessons || [];

        const totals = lessons.reduce(
            (acc, lesson) => {
                const events = lesson.events || [];
                const booking = lesson.booking;
                const schoolPackage = booking?.studentPackage?.schoolPackage;
                const durationMinutes = events.reduce((sum, event) => sum + (event.duration || 0), 0);
                const totalHours = durationMinutes / 60;
                const cph = parseFloat(lesson.commission?.cph || "0");
                const commissionType = lesson.commission?.commissionType || "fixed";
                const teacherCommission = commissionType === "fixed" ? cph * totalHours : cph * totalHours;

                const eventRows = transformEventsToRows(events);
                const studentCount = booking?.bookingStudents?.length || 1;
                const pricePerStudent = schoolPackage?.pricePerStudent || 0;
                const packageDurationMinutes = schoolPackage?.durationMinutes || 60;

                const lessonRevenue = eventRows.reduce((sum, eventRow) => {
                    const eventRevenue = calculateLessonRevenue(pricePerStudent, studentCount, eventRow.duration, packageDurationMinutes);
                    return sum + eventRevenue;
                }, 0);

                const schoolRevenue = lessonRevenue - teacherCommission;

                return {
                    lessonsCount: acc.lessonsCount + 1,
                    eventsCount: acc.eventsCount + events.length,
                    durationMinutes: acc.durationMinutes + durationMinutes,
                    commissions: acc.commissions + teacherCommission,
                    schoolRevenue: acc.schoolRevenue + schoolRevenue,
                };
            },
            { lessonsCount: 0, eventsCount: 0, durationMinutes: 0, commissions: 0, schoolRevenue: 0 },
        );

        const TeacherIcon = teacherEntity.icon;

        return [
            {
                label: teacher.schema.username,
                icon: <TeacherIcon />,
                value: teacher.schema.username,
                color: teacherEntity.color,
            },
            {
                label: "Lessons",
                icon: <LessonIcon />,
                value: totals.lessonsCount,
                color: lessonEntity.color,
            },
            {
                label: "Events",
                icon: <FlagIcon />,
                value: totals.eventsCount,
                color: eventEntity.color,
            },
            {
                label: "Duration",
                icon: <DurationIcon />,
                value: getFullDuration(totals.durationMinutes),
                color: "#4b5563",
            },
            {
                label: "Commission",
                icon: <HandshakeIcon />,
                value: getCompactNumber(totals.commissions),
                color: commissionEntity?.color || "#a78bfa",
            },
            {
                label: "School Revenue",
                icon: totals.schoolRevenue >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />,
                value: getCompactNumber(Math.abs(totals.schoolRevenue)),
                color: "rgb(251, 146, 60)",
            },
        ];
    },
};
