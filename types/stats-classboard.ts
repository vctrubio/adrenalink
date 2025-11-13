export interface ClassboardStatItem {
    label: string;
    value: string | number;
    color: string;
    bgColor: string;
}

export interface ClassboardStatsDisplay {
    items: ClassboardStatItem[];
}

export function createTeacherStatsDisplay(
    eventCount: number,
    totalDuration: number,
    teacherEarnings: number,
    schoolEarnings: number,
    formatDuration: (minutes: number) => string
): ClassboardStatsDisplay {
    return {
        items: [
            {
                label: "Events",
                value: eventCount,
                color: "text-blue-600 dark:text-blue-400",
                bgColor: "bg-blue-50/50 dark:bg-blue-950/50",
            },
            {
                label: "Duration",
                value: formatDuration(totalDuration),
                color: "text-purple-600 dark:text-purple-400",
                bgColor: "bg-purple-50/50 dark:bg-purple-950/50",
            },
            {
                label: "Teacher",
                value: `€${teacherEarnings.toFixed(2)}`,
                color: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-50/50 dark:bg-green-950/50",
            },
            {
                label: "School",
                value: `€${schoolEarnings.toFixed(2)}`,
                color: "text-orange-600 dark:text-orange-400",
                bgColor: "bg-orange-50/50 dark:bg-orange-950/50",
            },
        ],
    };
}
