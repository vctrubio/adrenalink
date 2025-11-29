"use client";

import { useTransition } from "react";
import { Popup } from "@/src/components/ui/popup";
import FormButton from "@/src/components/ui/form/form-button";
import { updateEvent } from "@/actions/events-action";
import { getPrettyDuration } from "@/getters/duration-getter";
import { ENTITY_DATA } from "@/config/entities";
import { Clock, Edit, X, Check, Sailboat } from "lucide-react";

// --- Sub-components defined as per clean-code-thesis.md ---

/**
 * Header: Displays the date, time, and location of the event in a ticket-style format.
 */
const CardHeader = ({ month, day, time, duration, location, eventEntityColor }: any) => (
    <div className="border-b border-white/10 pb-4 mb-4">
        <div className="flex items-start gap-3">
            {/* Time Ticket */}
            <div className="bg-white/10 rounded-lg p-2 text-center w-28">
                <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3 h-3" style={{ color: eventEntityColor }}/>
                    <p className="text-xs font-bold uppercase" style={{ color: eventEntityColor }}>
                        {getPrettyDuration(duration)}
                    </p>
                </div>
                <p className="text-3xl font-black text-white font-mono">{time}</p>
            </div>
            {/* Date and Location Info */}
            <div className="pt-1">
                <p className="font-bold text-lg text-white">{month} {day}</p>
                <p className="text-sm text-white/60">{location}</p>
            </div>
        </div>
    </div>
);

/**
 * Body: Displays the participants (teacher, students) and equipment.
 */
const CardBody = ({ teacher, students, schoolPackage, teacherEntity, studentEntity }: any) => {
    const TeacherIcon = teacherEntity?.icon || Edit;
    const StudentIcon = studentEntity?.icon || Edit;

    return (
        <div className="space-y-4 text-sm flex-1">
            {/* Teacher Section */}
            <div className="bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                    <TeacherIcon className="w-5 h-5 flex-shrink-0" style={{ color: teacherEntity?.color }} />
                    <h4 className="font-semibold text-white/80">Instructor</h4>
                </div>
                <p className="font-bold text-lg text-white ml-8">{teacher.firstName} {teacher.lastName}</p>
            </div>
            {/* Students Section */}
            <div className="bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                    <StudentIcon className="w-5 h-5 flex-shrink-0" style={{ color: studentEntity?.color }} />
                    <h4 className="font-semibold text-white/80">Students ({students.length})</h4>
                </div>
                <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    {students.map((student: any) => (
                        <span key={student.id} className="font-medium text-white/90 truncate">{student.firstName} {student.lastName}</span>
                    ))}
                </div>
            </div>
             {/* Equipment Section */}
            <div className="bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                    <Sailboat className="w-5 h-5 text-white/40 flex-shrink-0" />
                     <h4 className="font-semibold text-white/80">Equipment</h4>
                    <span className="font-semibold text-white ml-auto capitalize">{schoolPackage.categoryEquipment} x{schoolPackage.capacityEquipment}</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Footer: Contains the action buttons for the event.
 */
const CardFooter = ({ onComplete, isPending, status }: any) => (
    <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-center gap-2">
            <FormButton variant="secondary" size="sm" className="flex-1 bg-white/5 text-white/80 hover:bg-white/10 focus:ring-white/20">
                <Edit className="w-4 h-4 mr-2" /> Edit
            </FormButton>
            <FormButton variant="destructive" size="sm" className="flex-1 bg-red-900/40 text-red-400 hover:bg-red-900/60 focus:ring-red-800">
                <X className="w-4 h-4 mr-2" /> Cancel
            </FormButton>
            <FormButton
                variant="primary"
                size="sm"
                className="flex-1 bg-sky-600/60 text-sky-300 hover:bg-sky-600/80 focus:ring-sky-500 disabled:bg-white/5 disabled:text-white/40"
                onClick={onComplete}
                disabled={isPending || status === "completed"}
            >
                <Check className="w-4 h-4 mr-2" /> {isPending ? "Completing..." : (status === "completed" ? "Completed" : "Complete")}
            </FormButton>
        </div>
    </div>
);


// --- Main Parent Component ---

export function EventDisplayCard({ event, lesson, students, schoolPackage, userRole }: any) {
    const [isPending, startTransition] = useTransition();
    const { teacher } = lesson;

    // --- Data Processing Layer ---
    const teacherEntity = ENTITY_DATA.find(e => e.id === "teacher");
    const studentEntity = ENTITY_DATA.find(e => e.id === "student");
    const eventEntity = ENTITY_DATA.find(e => e.id === "event");

    const eventDate = new Date(event.date);
    const time = eventDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    const day = eventDate.toLocaleDateString("en-US", { day: "numeric" });
    const month = eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

    const handleComplete = () => {
        startTransition(async () => {
            await updateEvent(event.id, { status: "completed" });
        });
    };

    // --- Rendering Layer ---
    return (
        <Popup>
            <div className="p-4 md:p-6 flex-1 flex flex-col">
                <CardHeader
                    month={month}
                    day={day}
                    location={event.location}
                    time={time}
                    duration={event.duration}
                    eventEntityColor={eventEntity?.color}
                />
                <CardBody
                    teacher={teacher}
                    students={students}
                    schoolPackage={schoolPackage}
                    teacherEntity={teacherEntity}
                    studentEntity={studentEntity}
                />
                <CardFooter
                    onComplete={handleComplete}
                    isPending={isPending}
                    status={event.status}
                />
            </div>
        </Popup>
    );
}