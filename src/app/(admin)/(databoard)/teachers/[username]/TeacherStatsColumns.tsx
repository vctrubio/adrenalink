"use client";

import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import type { TeacherModel } from "@/backend/models";
import BookingIcon from "@/public/appSvgs/BookingIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import BankIcon from "@/public/appSvgs/BankIcon";
import LessonIcon from "@/public/appSvgs/LessonIcon";

export function TeacherStatsColumns({ teacher }: { teacher: TeacherModel }) {
    const lessonEntity = ENTITY_DATA.find((e) => e.id === "lesson")!;
    const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;

    const lessons = teacher.relations?.lessons || [];
    const totalEvents = lessons.reduce((sum, lesson) => sum + (lesson.events?.length || 0), 0);
    const totalDurationMinutes = lessons.reduce((sum, lesson) => {
        return sum + (lesson.events?.reduce((eventSum, event) => eventSum + (event.duration || 0), 0) || 0);
    }, 0);

    const moneyIn = teacher.stats?.money_in || 0;
    const moneyOut = teacher.stats?.money_out || 0;

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Teacher Statistics</h2>
            <div className="flex justify-around gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <LessonIcon className="w-4 h-4" style={{ color: lessonEntity.color }} />
                        <p className="text-sm text-muted-foreground">Lessons</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{lessons.length}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FlagIcon className="w-4 h-4" style={{ color: eventEntity.color }} />
                        <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
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
                        <p className="text-sm text-muted-foreground">Earnings</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">${moneyIn}</p>
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <BankIcon className="w-4 h-4" style={{ color: "#4b5563" }} />
                        <p className="text-sm text-muted-foreground">Payouts</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600">${moneyOut}</p>
                </div>
            </div>
        </div>
    );
}
