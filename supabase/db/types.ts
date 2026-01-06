/**
 * Database Type Definitions
 * Single source of truth for all database row types
 * Mirrors the schema structure from supabase/schema/*.sql
 */

export interface School {
    id: string;
    wallet_id: string;
    name: string;
    username: string;
    country: string;
    phone: string;
    status: string;
    currency: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    google_place_id: string | null;
    equipment_categories: string | null;
    website_url: string | null;
    instagram_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    created_at: string;
    updated_at: string;
}

export interface Teacher {
    id: string;
    school_id: string;
    first_name: string;
    last_name: string;
    username: string;
    passport: string;
    country: string;
    phone: string;
    languages: string[];
    active: boolean;
    created_at: string;
    updated_at: string;
}

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

export interface Booking {
    id: string;
    school_id: string;
    school_package_id: string;
    date_start: string;
    date_end: string;
    leader_student_name: string;
    status: string;
    created_at: string;
    updated_at: string;
}

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
