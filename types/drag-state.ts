/**
 * Drag and drop state for classboard operations
 * Manages drag state, event handlers, and UI styling for teacher columns
 */

export type DragCompatibility = "compatible" | "incompatible" | null;

export interface DragState {
    dragOverTeacher: string | null;
    dragCompatibility: DragCompatibility;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent, username: string) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, username: string) => void;
    dragOverTeacherColumn: (teacherUsername: string) => string;
}

/**
 * Get border color for a teacher column based on drag state
 * @param dragOverTeacher - Username of teacher being dragged over
 * @param dragCompatibility - Whether the booking is compatible with this teacher
 * @param teacherUsername - Username of the column to check
 * @returns Tailwind border color class
 */
export function getDragOverTeacherColumnColor(
    dragOverTeacher: string | null,
    dragCompatibility: DragCompatibility,
    teacherUsername: string
): string {
    if (dragOverTeacher !== teacherUsername) return "border-transparent";
    if (dragCompatibility === "compatible") return "border-green-400";
    if (dragCompatibility === "incompatible") return "border-orange-400";
    return "border-transparent";
}
