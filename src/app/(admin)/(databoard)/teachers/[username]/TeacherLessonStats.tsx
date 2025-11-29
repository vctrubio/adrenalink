"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { getPrettyDuration } from "@/getters/duration-getter";
import type { TeacherLessonStatsData } from "@/getters/teacher-lesson-stats-getter";

interface TeacherLessonStatsProps {
    lessons: TeacherLessonStatsData[];
}

export function TeacherLessonStats({ lessons }: TeacherLessonStatsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    if (lessons.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">No lessons found for this teacher.</p>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Lessons</h2>
            {lessons.map((lesson) => {
                const isExpanded = expandedId === lesson.lessonId;
                return (
                    <div key={lesson.lessonId} className="border border-border rounded-lg overflow-hidden">
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : lesson.lessonId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                        >
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{lesson.dateRange}</p>
                                <p className="text-xs text-muted-foreground mt-1">{lesson.packageDescription}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-foreground">{lesson.eventsCount} events</p>
                                    <p className="text-xs text-muted-foreground">{lesson.durationHours.toFixed(1)}h</p>
                                </div>
                                <ChevronDown size={20} className="text-muted-foreground" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-border p-4 bg-muted/10 space-y-3 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-muted-foreground">Booking Status</p>
                                        <p className="font-medium text-foreground capitalize">{lesson.bookingStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Events</p>
                                        <p className="font-medium text-foreground">{lesson.eventsCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Duration</p>
                                        <p className="font-medium text-foreground">{getPrettyDuration(Math.round(lesson.durationHours * 60))}</p>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-3 font-mono">
                                    <div className="flex justify-between mb-2 text-muted-foreground">
                                        <span>Commission Formula:</span>
                                        <span className="text-xs text-right">{lesson.formula}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Amount to be paid:</span>
                                        <span className="text-foreground">${lesson.moneyToPay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted-foreground">Money Paid:</span>
                                        <span className="text-foreground">${lesson.moneyPaid.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold text-foreground">Balance:</span>
                                        <span
                                            className="font-bold"
                                            style={{
                                                color: lesson.balance >= 0 ? "#10b981" : "#ef4444",
                                            }}
                                        >
                                            ${Math.abs(lesson.balance).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
