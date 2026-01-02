import { TeacherQueue } from "@/src/app/(admin)/(classboard)/TeacherQueue";

export function generateDailyScheduleText(teacherQueues: TeacherQueue[], date: string): string {
    let text = `📅 Schedule for ${date}\n\n`;

    // Sort teachers alphabetically by username
    const sortedQueues = [...teacherQueues].sort((a, b) => 
        a.teacher.username.localeCompare(b.teacher.username)
    );

    sortedQueues.forEach((queue) => {
        const events = queue.getAllEvents();
        if (events.length === 0) return;

        text += `👤 ${queue.teacher.username}\n`;
        text += `─────────────────────\n`;

        events.forEach((event) => {
            const time = event.eventData.date.split("T")[1].substring(0, 5);
            const duration = event.eventData.duration;
            const location = event.eventData.location || "No Location";
            
            // Format student names
            const students = event.bookingStudents
                .map(s => `${s.firstName} ${s.lastName}`)
                .join(", ");

            text += `⏰ ${time} (${duration}m) @ ${location}\n`;
            text += `🎓 ${students}\n`;
            text += `\n`;
        });
        
        text += `\n`;
    });

    return text;
}
