/**
 * Database Type Definitions
 * Single source of truth for all database row types
 * Mirrors the schema structure from supabase/schema/*.sql
 *
 * Usage:
 * - Import these types in server functions: `import { School, Student, Teacher } from "@/supabase/db/types"`
 * - Use them for function return types: `Promise<School[]>`
 * - Cast query results: `data as School`
 */

/** School entity - Represents a school/institution in the system */
export interface School {
    id: string;
    name: string;
    username: string;
    email: string | null;
    clerk_id: string | null;
    country: string;
    phone: string;
    status: string;
    currency: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    google_place_id: string | null;
    equipment_categories: string | null; // Pipe-separated list: "swimming|diving|kayaking"
    website_url: string | null;
    instagram_url: string | null;
    created_at: string;
    updated_at: string;
}

/** School with verified CDN assets - Used for display pages */
export interface SchoolWithAssets extends School {
    bannerUrl: string;
    iconUrl: string;
}

/** Student entity - Represents a student/participant */
export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[]; // JSON array: ["English", "Spanish"]
    created_at: string;
    updated_at: string;
}

/** SchoolStudent entity - Junction table for School <-> Student */
export interface SchoolStudent {
    school_id: string;
    student_id: string;
    description: string | null;
    email: string | null;
    clerk_id: string | null;
    active: boolean;
    rental: boolean;
    created_at: string;
}

/** Teacher entity - Represents an instructor/teacher */
export interface Teacher {
    id: string;
    school_id: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string | null;
    clerk_id: string | null;
    passport: string;
    country: string;
    phone: string;
    languages: string[]; // JSON array: ["English", "Spanish"]
    active: boolean;
    created_at: string;
    updated_at: string;
}

/** Equipment entity - Represents physical equipment/gear */
export interface Equipment {
    id: string;
    school_id: string;
    brand: string | null;
    category: string;
    size: number;
    color: string | null;
    public: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}

/** SchoolPackage entity - Represents a package/service offering */
export interface SchoolPackage {
    id: string;
    duration_minutes: number;
    description: string;
    price_per_student: number;
    capacity_students: number;
    capacity_equipment: number;
    category_equipment: string;
    package_type: string;
    school_id: string | null;
    is_public: boolean;
    active: boolean;
    created_at: string;
    updated_at: string;
}

/** Booking entity - Represents a booking/reservation */
export interface Booking {
    id: string;
    school_id: string;
    school_package_id: string;
    referral_id: string | null;
    date_start: string;
    date_end: string;
    leader_student_name: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/** BookingStudent junction entity */
export interface BookingStudent {
    booking_id: string;
    student_id: string;
    student_package_id: string | null;
}

/** Lesson entity - Represents a lesson/training session */
export interface Lesson {
    id: string;
    school_id: string;
    teacher_id: string;
    booking_id: string;
    commission_id: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/** Event entity - Represents an event/activity occurrence */
export interface Event {
    id: string;
    school_id: string;
    lesson_id: string;
    date: string;
    duration: number;
    location: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/** StudentPackage entity - Represents a request/purchase of a package by a student */
export interface StudentPackage {
    id: string;
    school_package_id: string;
    referral_id: string | null;
    wallet_id: string;
    requested_date_start: string;
    requested_date_end: string;
    status: string;
    created_at: string;
    updated_at: string;
}

/** StudentPackageStudent junction entity */
export interface StudentPackageStudent {
    id: string;
    student_package_id: string;
    student_id: string;
    created_at: string;
}

/** Referral entity - Represents a partner/referral code */
export interface Referral {
    id: string;
    code: string;
    school_id: string;
    commission_type: string;
    commission_value: string;
    description: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}
