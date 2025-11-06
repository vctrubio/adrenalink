import { TimesheetClient, type TimesheetEntryData } from "@/src/components/timesheet/timesheet-client";

// Simulate server-side data fetching
async function getTimesheetEntries(): Promise<TimesheetEntryData[]> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    return [
        // Today
        {
            id: "1",
            title: "Wireframe for Zoo Website",
            subtitle: "Zoo Web Project",
            tagLabel: "New Project",
            tagColor: "#f97316",
            date: today,
        },
        {
            id: "2",
            title: "Mobile Version",
            subtitle: "Course Dashboard",
            tagLabel: "On Going Project",
            tagColor: "#22c55e",
            date: today,
        },
        {
            id: "3",
            title: "Wireframe for Zoo Website",
            subtitle: "Zoo Web Project",
            tagLabel: "On Going Project",
            tagColor: "#22c55e",
            date: today,
        },

        // Yesterday
        {
            id: "4",
            title: "Homepage - Mobile Version",
            subtitle: "Course Dashboard",
            tagLabel: "On Going Project",
            tagColor: "#22c55e",
            date: yesterday,
        },

        // Two days ago
        {
            id: "5",
            title: "Meetings with Clients",
            subtitle: "Zoo Web Project",
            tagLabel: "Meetings",
            tagColor: "#3b82f6",
            date: twoDaysAgo,
        },
        {
            id: "6",
            title: "Details Pages - Desktop Version",
            subtitle: "Course Dashboard",
            tagLabel: "On Going Project",
            tagColor: "#22c55e",
            date: twoDaysAgo,
        },

        // Three days ago
        {
            id: "7",
            title: "API Integration",
            subtitle: "Zoo Web Project",
            tagLabel: "Development",
            tagColor: "#8b5cf6",
            date: threeDaysAgo,
        },
        {
            id: "8",
            title: "Design Review",
            subtitle: "Course Dashboard",
            tagLabel: "Review",
            tagColor: "#ec4899",
            date: threeDaysAgo,
        },

        // Last week
        {
            id: "9",
            title: "Backend Development",
            subtitle: "Zoo Web Project",
            tagLabel: "Development",
            tagColor: "#8b5cf6",
            date: lastWeek,
        },

        // Two weeks ago
        {
            id: "10",
            title: "Initial Planning",
            subtitle: "Course Dashboard",
            tagLabel: "Planning",
            tagColor: "#06b6d4",
            date: twoWeeksAgo,
        },
    ];
}

export default async function MockTimesheetPage() {
    // Fetch data on server
    const entries = await getTimesheetEntries();

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <TimesheetClient entries={entries} />
            </div>
        </div>
    );
}
