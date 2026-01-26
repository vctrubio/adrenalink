import { SupabaseClient } from "@supabase/supabase-js";
import { TransactionEventData } from "@/types/transaction-event";
import { lessonsToTransactionEvents } from "@/getters/booking-lesson-event-getter"; // Import unified getter

// --- Types ---

// EventTransaction interface remains for RPC call raw output
export interface EventTransaction {
    event_id: string;
    lesson_id: string;
    booking_id: string;
    teacher_id: string;
    school_id: string;
    event_date: string;
    event_duration: number;
    event_location: string;
    event_status: string;
    student_count: number;
    leader_student_name: string;
    teacher_username: string;
    package_description: string;
    package_category_equipment: string;
    package_capacity_equipment: number;
    package_capacity_students: number;
    price_per_student: number;
    commission_hourly: number;
    commission_type: string;
    gross_revenue: number;
    teacher_commission: number;
    net_revenue: number;
    students_json: {
        id: string;
        name: string;
        passport?: string;
        country?: string;
        phone?: string;
    }[];
    equipments: {
        id?: string;
        brand: string;
        model: string;
        size: number | null;
        category?: string;
        sku?: string;
        color?: string;
    }[];
}

// --- RPC Getters ---

/**
 * Fetch revenue data for a single event without loading full relations
 * and transform it into TransactionEventData using unified getter.
 */
export async function getEventTransaction(supabase: SupabaseClient, eventId: string, currency: string): Promise<TransactionEventData | null> {
    const { data, error } = await supabase.rpc("get_event_transaction", { p_event_id: eventId }).single();

    if (error) {
        throw new Error(`Failed to fetch event transaction: ${error.message}`);
    }

    if (!data) return null;

    // Create a mock 'lesson' object structure that lessonsToTransactionEvents expects
    const mockLesson = {
        id: data.lesson_id,
        status: data.event_status, // Use event status as lesson status for this context
        teacher: {
            id: data.teacher_id,
            username: data.teacher_username,
            first_name: "", // Not available from RPC
            last_name: "", // Not available from RPC
        },
        teacher_commission: {
            id: "", // Not available from RPC
            cph: data.commission_hourly.toString(),
            commission_type: data.commission_type,
            description: null,
        },
        booking: {
            id: data.booking_id,
            leader_student_name: data.leader_student_name,
            status: "active", // Default booking status
            school_package: {
                id: "", // Not available from RPC
                description: data.package_description,
                category_equipment: data.package_category_equipment,
                capacity_equipment: data.package_capacity_equipment,
                capacity_students: data.package_capacity_students,
                duration_minutes: data.event_duration, // Use event duration for package duration
                price_per_student: data.price_per_student,
            },
            booking_student: data.students_json.map((s: any) => ({
                student: {
                    id: s.id,
                    first_name: s.name.split(" ")[0] || "",
                    last_name: s.name.split(" ")[1] || "",
                    passport: s.passport,
                    country: s.country,
                    phone: s.phone,
                },
            })),
        },
        event: [ // lessonsToTransactionEvents expects an array of events
            {
                id: data.event_id,
                date: data.event_date,
                duration: data.event_duration,
                location: data.event_location,
                status: data.event_status,
                equipment_event: data.equipments.map((eq: any) => ({
                    equipment: {
                        id: eq.id,
                        brand: eq.brand,
                        model: eq.model,
                        size: eq.size,
                        sku: eq.sku,
                        color: eq.color,
                        category: eq.category,
                    },
                })),
            },
        ],
        teacher_lesson_payment: [], // Not available from RPC
    };

    const transactions = lessonsToTransactionEvents([mockLesson], currency);
    return transactions[0] || null;
}

/**
 * Fetch revenue data for multiple events
 */
export async function getEventTransactions(supabase: SupabaseClient, eventIds: string[], currency: string): Promise<TransactionEventData[]> {
    const { data, error } = await supabase.rpc("get_event_transactions_batch", {
        p_event_ids: eventIds,
    });

    if (error) {
        throw new Error(`Failed to fetch event transactions: ${error.message}`);
    }

    if (!data || data.length === 0) return [];

    // Group by lesson_id and construct mock lessons for lessonsToTransactionEvents
    const lessonsMap = new Map<string, any>();
    data.forEach((item: EventTransaction) => {
        if (!lessonsMap.has(item.lesson_id)) {
            lessonsMap.set(item.lesson_id, {
                id: item.lesson_id,
                status: item.event_status,
                teacher: {
                    id: item.teacher_id,
                    username: item.teacher_username,
                    first_name: "",
                    last_name: "",
                },
                teacher_commission: {
                    id: "",
                    cph: item.commission_hourly.toString(),
                    commission_type: item.commission_type,
                    description: null,
                },
                booking: {
                    id: item.booking_id,
                    leader_student_name: item.leader_student_name,
                    status: "active",
                    school_package: {
                        id: "",
                        description: item.package_description,
                        category_equipment: item.package_category_equipment,
                        capacity_equipment: item.package_capacity_equipment,
                        capacity_students: item.package_capacity_students,
                        duration_minutes: item.event_duration,
                        price_per_student: item.price_per_student,
                    },
                    booking_student: item.students_json.map((s: any) => ({
                        student: {
                            id: s.id,
                            first_name: s.name.split(" ")[0] || "",
                            last_name: s.name.split(" ")[1] || "",
                            passport: s.passport,
                            country: s.country,
                            phone: s.phone,
                        },
                    })),
                },
                event: [],
                teacher_lesson_payment: [],
            });
        }
        lessonsMap.get(item.lesson_id).event.push({
            id: item.event_id,
            date: item.event_date,
            duration: item.event_duration,
            location: item.event_location,
            status: item.event_status,
            equipment_event: item.equipments.map((eq: any) => ({
                equipment: {
                    id: eq.id,
                    brand: eq.brand,
                    model: eq.model,
                    size: eq.size,
                    sku: eq.sku,
                    color: eq.color,
                    category: eq.category,
                },
            })),
        });
    });

    const mockLessons = Array.from(lessonsMap.values());
    return lessonsToTransactionEvents(mockLessons, currency);
}

/**
 * Fetch all event transactions for a booking
 */
export async function getBookingEventTransactions(supabase: SupabaseClient, bookingId: string, currency: string): Promise<TransactionEventData[]> {
    const { data, error } = await supabase.rpc("get_booking_event_transactions", {
        p_booking_id: bookingId,
    }).single(); // Assuming this returns a single booking with nested lessons/events

    if (error) {
        throw new Error(`Failed to fetch booking event transactions: ${error.message}`);
    }

    if (!data) return [];

    // This RPC returns the same structure as a single EventTransaction but for multiple events
    // We can reuse the mockLesson construction logic from getEventTransactions
    const lessonsMap = new Map<string, any>();
    safeArray(data).forEach((item: EventTransaction) => { // Assuming data is an array of EventTransaction
        if (!lessonsMap.has(item.lesson_id)) {
            lessonsMap.set(item.lesson_id, {
                id: item.lesson_id,
                status: item.event_status,
                teacher: {
                    id: item.teacher_id,
                    username: item.teacher_username,
                    first_name: "",
                    last_name: "",
                },
                teacher_commission: {
                    id: "",
                    cph: item.commission_hourly.toString(),
                    commission_type: item.commission_type,
                    description: null,
                },
                booking: {
                    id: item.booking_id,
                    leader_student_name: item.leader_student_name,
                    status: "active",
                    school_package: {
                        id: "",
                        description: item.package_description,
                        category_equipment: item.package_category_equipment,
                        capacity_equipment: item.package_capacity_equipment,
                        capacity_students: item.package_capacity_students,
                        duration_minutes: item.event_duration,
                        price_per_student: item.price_per_student,
                    },
                    booking_student: item.students_json.map((s: any) => ({
                        student: {
                            id: s.id,
                            first_name: s.name.split(" ")[0] || "",
                            last_name: s.name.split(" ")[1] || "",
                            passport: s.passport,
                            country: s.country,
                            phone: s.phone,
                        },
                    })),
                },
                event: [],
                teacher_lesson_payment: [],
            });
        }
        lessonsMap.get(item.lesson_id).event.push({
            id: item.event_id,
            date: item.event_date,
            duration: item.event_duration,
            location: item.event_location,
            status: item.event_status,
            equipment_event: item.equipments.map((eq: any) => ({
                equipment: {
                    id: eq.id,
                    brand: eq.brand,
                    model: eq.model,
                    size: eq.size,
                    sku: eq.sku,
                    color: eq.color,
                    category: eq.category,
                },
            })),
        });
    });
    
    const mockLessons = Array.from(lessonsMap.values());
    return lessonsToTransactionEvents(mockLessons, currency);
}