"use client";

import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface TeacherLessonComissionValueProps {
    commissionType: string;
    cph: number;
    currency: string;
}

export function TeacherLessonComissionValue({ commissionType, cph, currency }: TeacherLessonComissionValueProps) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="text-green-600 dark:text-green-400">
                <HandshakeIcon size={14} />
            </div>
            <span className="font-bold">
                {commissionType === "percentage" ? `${cph}%` : `${cph} ${currency}`}
            </span>
        </div>
    );
}
