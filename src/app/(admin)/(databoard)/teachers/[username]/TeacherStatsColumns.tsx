"use client";

import { getPrettyDuration } from "@/getters/duration-getter";
import { TeacherStats } from "@/getters/teachers-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { TeacherModel } from "@/backend/models";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";

export function TeacherStatsColumns({ teacher }: { teacher: TeacherModel }) {
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const lessonsCount = TeacherStats.getLessonsCount(teacher);
    const eventsCount = TeacherStats.getEventsCount(teacher);
    const totalDurationMinutes = teacher.stats?.total_duration_minutes || 0;

    const moneyIn = TeacherStats.getMoneyIn(teacher);
    const moneyOut = TeacherStats.getMoneyOut(teacher);
    const moneyEarned = TeacherStats.getMoneyEarned(teacher);

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Teacher Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <LessonIcon className="w-4 h-4" style={{ color: lessonEntity.color }} />
                        <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{lessonsCount}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FlagIcon className="w-4 h-4" style={{ color: eventEntity.color }} />
                        <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{eventsCount}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <DurationIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{getPrettyDuration(totalDurationMinutes)}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Income</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${moneyIn}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Expenses</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${moneyOut}</p>
                </div>
            </div>
        </div>
    );
}
