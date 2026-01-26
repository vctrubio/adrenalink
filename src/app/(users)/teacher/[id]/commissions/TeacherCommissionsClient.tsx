"use client";

import { useState } from "react";
import { useTeacherUser } from "@/src/providers/teacher-user-provider";
import { CommissionsView } from "@/src/components/teacher/CommissionsView";

export function TeacherCommissionsClient() {
    const { data: teacherUser, schoolHeader } = useTeacherUser();
    const currency = schoolHeader?.currency || "YEN";
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">My Commissions</h2>
            <CommissionsView
                lessonRows={teacherUser.lessonRows}
                expandedLesson={expandedLesson}
                setExpandedLesson={setExpandedLesson}
                currency={currency}
                teacherId={teacherUser.teacher.id}
                teacherUsername={teacherUser.teacher.username}
            />
        </div>
    );
}
