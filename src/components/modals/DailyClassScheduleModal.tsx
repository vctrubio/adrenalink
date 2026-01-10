"use client";

import { useState } from "react";
import Modal from "./Modal";
import type { TeacherQueue } from "@/backend/classboard/TeacherQueue";
import type { ClassboardStudent } from "@/backend/classboard/ClassboardModel";
import { getPrettyDuration } from "@/getters/duration-getter";

interface DailyClassScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    teacherQueues: TeacherQueue[];
}

interface StudentFieldOptions {
    firstName: boolean;
    lastName: boolean;
    passport: boolean;
    country: boolean;
    phone: boolean;
}

interface TeacherFieldOptions {
    username: boolean;
    firstName: boolean;
    lastName: boolean;
}

type ViewMode = "text" | "table";

export default function DailyClassScheduleModal({ isOpen, onClose, selectedDate, teacherQueues }: DailyClassScheduleModalProps) {
    const [studentFields, setStudentFields] = useState<StudentFieldOptions>({
        firstName: true,
        lastName: true,
        passport: false,
        country: false,
        phone: false,
    });

    const [teacherFields, setTeacherFields] = useState<TeacherFieldOptions>({
        username: true,
        firstName: true,
        lastName: true,
    });

    const [viewMode, setViewMode] = useState<ViewMode>("text");

    const toggleStudentField = (field: keyof StudentFieldOptions) => {
        setStudentFields((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const toggleTeacherField = (field: keyof TeacherFieldOptions) => {
        setTeacherFields((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const formatTeacherName = (queue: TeacherQueue) => {
        const parts: string[] = [];
        if (teacherFields.username) parts.push(queue.teacher.username);
        if (teacherFields.firstName) parts.push(queue.teacher.name.split(" ")[0]);
        if (teacherFields.lastName) parts.push(queue.teacher.name.split(" ").slice(1).join(" "));
        return parts.filter(Boolean).join(" ");
    };

    const formatStudentName = (students: ClassboardStudent[]) => {
        return students
            .map((s) => {
                const parts: string[] = [];
                if (studentFields.firstName) parts.push(s.firstName);
                if (studentFields.lastName) parts.push(s.lastName);
                if (studentFields.passport) parts.push(s.passport);
                if (studentFields.country) parts.push(s.country);
                if (studentFields.phone) parts.push(s.phone);
                return parts.filter(Boolean).join(" ");
            })
            .join(", ");
    };

    const formatEquipment = (category: string, capacity: number): string => {
        return capacity > 1 ? `${category} (x${capacity})` : category;
    };

    const renderTextView = () => {
        return (
            <div className="space-y-6">
                {teacherQueues.map((queue) => {
                    const events = queue.getAllEvents();
                    if (events.length === 0) return null;

                    return (
                        <div key={queue.teacher.username} className="border-b border-border pb-4 last:border-0">
                            <h4 className="font-semibold text-lg mb-3">{formatTeacherName(queue)}</h4>
                            <div className="space-y-2">
                                {events.map((eventNode, idx) => (
                                    <div key={eventNode.id} className="pl-4 text-sm">
                                        <p className="text-muted-foreground">
                                            {idx + 1}.{" "}
                                            {new Date(eventNode.eventData.date).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                            })}
                                            {" - "}
                                            {getPrettyDuration(eventNode.eventData.duration)} at {eventNode.eventData.location} (
                                            {formatEquipment(
                                                eventNode.packageData.categoryEquipment,
                                                eventNode.packageData.capacityEquipment,
                                            )}
                                            )
                                        </p>
                                        <p className="font-medium">Students: {formatStudentName(eventNode.studentData)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTableView = () => {
        return (
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="p-3 text-left text-sm font-semibold">Teacher</th>
                            <th className="p-3 text-left text-sm font-semibold">Time</th>
                            <th className="p-3 text-left text-sm font-semibold">Duration</th>
                            <th className="p-3 text-left text-sm font-semibold">Location</th>
                            <th className="p-3 text-left text-sm font-semibold">Equipment</th>
                            <th className="p-3 text-left text-sm font-semibold">Students</th>
                            <th className="p-3 text-left text-sm font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teacherQueues.map((queue) => {
                            const events = queue.getAllEvents();
                            return events.map((eventNode, idx) => (
                                <tr key={eventNode.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    {idx === 0 && (
                                        <td className="p-3 font-medium" rowSpan={events.length}>
                                            {formatTeacherName(queue)}
                                        </td>
                                    )}
                                    <td className="p-3 text-sm font-mono">
                                        {new Date(eventNode.eventData.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })}
                                    </td>
                                    <td className="p-3 text-sm">{getPrettyDuration(eventNode.eventData.duration)}</td>
                                    <td className="p-3 text-sm">{eventNode.eventData.location}</td>
                                    <td className="p-3 text-sm">
                                        {formatEquipment(
                                            eventNode.packageData.categoryEquipment,
                                            eventNode.packageData.capacityEquipment,
                                        )}
                                    </td>
                                    <td className="p-3 text-sm">{formatStudentName(eventNode.studentData)}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                eventNode.eventData.status === "completed"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    : eventNode.eventData.status === "planned"
                                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                            }`}
                                        >
                                            {eventNode.eventData.status}
                                        </span>
                                    </td>
                                </tr>
                            ));
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Daily Class Schedule" maxWidth="5xl">
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="text-sm text-muted-foreground">
                        Schedule for <strong>{selectedDate}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode("text")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "text"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            Text View
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === "table"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            Table View
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-4 border-b border-border">
                    <div>
                        <h4 className="font-semibold mb-3">Student Fields</h4>
                        <div className="space-y-2">
                            {(Object.keys(studentFields) as (keyof StudentFieldOptions)[]).map((field) => (
                                <label key={field} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={studentFields[field]}
                                        onChange={() => toggleStudentField(field)}
                                        className="w-4 h-4 rounded border-border"
                                    />
                                    <span className="text-sm capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-3">Teacher Fields</h4>
                        <div className="space-y-2">
                            {(Object.keys(teacherFields) as (keyof TeacherFieldOptions)[]).map((field) => (
                                <label key={field} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={teacherFields[field]}
                                        onChange={() => toggleTeacherField(field)}
                                        className="w-4 h-4 rounded border-border"
                                    />
                                    <span className="text-sm capitalize">{field.replace(/([A-Z])/g, " $1").trim()}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
                    {viewMode === "text" ? renderTextView() : renderTableView()}
                </div>
            </div>
        </Modal>
    );
}
