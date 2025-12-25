"use client";

import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";

interface TeacherLessonComissionValueProps {
    commissionType: string;
    cph: number;
    currency: string;
}

export function TeacherLessonComissionValue({ commissionType, cph, currency }: TeacherLessonComissionValueProps) {
    return (
        <div className="flex items-center gap-1.5" style={{ color: "#22c55e" }}>
            <HandshakeIcon size={14} />
            <span className="font-bold text-green-600 dark:text-green-400">
                {commissionType === "percentage" ? `${cph}%` : `${cph} ${currency}`}
            </span>
        </div>
    );
}
