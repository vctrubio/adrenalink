import AdminIcon from "@/public/appSvgs/AdminIcon.jsx";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon.jsx";
import HelmetIcon from "@/public/appSvgs/HelmetIcon.jsx";
import { JSX } from "react";

export type RoleType =
    | "owner"
    | "school_admin"
    | "teacher_active"
    | "teacher_inactive"
    | "teacher_unlinked"
    | "student_standard"
    | "student_rental"
    | "student_unlinked"
    | "authenticated_no_role"
    | "guest";

interface RoleConfig {
    label: string;
    descriptionPoints: string[];
    icon: (props: { className?: string; size?: number; rental?: boolean }) => JSX.Element;
    colorClass: string;
    bgClass: string;
}

export const ROLE_CONFIG: Record<RoleType, RoleConfig> = {
    // --- School Roles ---
    owner: {
        label: "Owner",
        descriptionPoints: [
            "Primary account holder linked to school ID.",
            "Ultimate control over billing & settings.",
            "Cannot be removed by other admins.",
        ],
        icon: AdminIcon,
        colorClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-50 dark:bg-purple-900/10",
    },
    school_admin: {
        label: "Admin",
        descriptionPoints: [
            "Managed via `school_admins` relation.",
            "Broad access to daily operations.",
            "Can manage bookings, teachers, and students.",
        ],
        icon: AdminIcon,
        colorClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-50 dark:bg-blue-900/10",
    },

    // --- Teacher Roles ---
    teacher_active: {
        label: "Teacher (Active)",
        descriptionPoints: [
            "Active instructor with linked Clerk ID.",
            "Can accept bookings & commissions.",
            "Visible on public schedules.",
        ],
        icon: HeadsetIcon,
        colorClass: "text-green-600 dark:text-green-400",
        bgClass: "bg-green-50 dark:bg-green-900/10",
    },
    teacher_inactive: {
        label: "Teacher (Inactive)",
        descriptionPoints: ["`active` flag set to FALSE.", "Cannot accept new bookings.", "Muted headset icon."],
        icon: HeadsetIcon,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
    },
    teacher_unlinked: {
        label: "Teacher (Unlinked)",
        descriptionPoints: ["Entity exists but no Clerk ID linked.", "Cannot log in yet.", "Blue icon indicates pending auth."],
        icon: HeadsetIcon,
        colorClass: "text-blue-500",
        bgClass: "bg-blue-50 dark:bg-blue-900/10",
    },

    // --- Student Roles ---
    student_standard: {
        label: "Student (Standard)",
        descriptionPoints: [
            "Linked via `school_students` with Clerk ID.",
            "Standard learning progression.",
            "Owns their own equipment.",
        ],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-yellow-600 dark:text-yellow-400",
        bgClass: "bg-yellow-50 dark:bg-yellow-900/10",
    },
    student_rental: {
        label: "Student (Rental)",
        descriptionPoints: ["`rental` flag set to TRUE.", "Can rent school equipment.", "Red helmet indicates rental status."],
        icon: (props) => <HelmetIcon {...props} rental />,
        colorClass: "text-destructive",
        bgClass: "bg-destructive/10",
    },
    student_unlinked: {
        label: "Student (Unlinked)",
        descriptionPoints: ["Entity exists but no Clerk ID linked.", "Cannot view portal yet.", "Blue icon indicates pending auth."],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-blue-500",
        bgClass: "bg-blue-50 dark:bg-blue-900/10",
    },

    // --- System Roles ---
    authenticated_no_role: {
        label: "Authenticated (Unassigned)",
        descriptionPoints: ["Signed in via Clerk.", "Not linked to any school yet.", "Pending assignment or onboarding."],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-secondary",
        bgClass: "bg-secondary/10",
    },
    guest: {
        label: "Guest",
        descriptionPoints: ["Unauthenticated user.", "Limited public access.", "Must sign in to interact."],
        icon: (props) => <HelmetIcon {...props} />,
        colorClass: "text-muted-foreground",
        bgClass: "bg-muted/30",
    },
};
