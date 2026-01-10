import { SupabaseClient } from '@supabase/supabase-js';
import { TransactionEventData } from '@/types/transaction-event';

// --- Types ---

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
    }[];
    equipments: {
        brand: string;
        model: string;
        size: number | null;
        category: string;
    }[];
}

// --- Mapper ---

/**
 * Maps RPC result to the rich TransactionEventData type used by components
 */
export function mapTransactionToEventData(t: EventTransaction, currency: string = 'YEN'): TransactionEventData {
    return {
        event: {
            id: t.event_id,
            date: t.event_date,
            duration: t.event_duration,
            location: t.event_location,
            status: t.event_status,
        },
        teacher: {
            id: t.teacher_id,
            username: t.teacher_username,
        },
        leaderStudentName: t.leader_student_name,
        studentCount: t.student_count,
        studentNames: t.students_json.map(s => s.name),
        packageData: {
            description: t.package_description,
            pricePerStudent: t.price_per_student,
            durationMinutes: t.event_duration,
            categoryEquipment: t.package_category_equipment,
            capacityEquipment: t.package_capacity_equipment,
            capacityStudents: t.package_capacity_students,
        },
        financials: {
            teacherEarnings: t.teacher_commission,
            studentRevenue: t.gross_revenue,
            profit: t.net_revenue,
            currency: currency,
            commissionType: t.commission_type as "fixed" | "percentage",
            commissionValue: t.commission_hourly,
        },
        equipments: t.equipments.map(eq => ({
            id: (eq as any).id || '',
            brand: eq.brand,
            model: eq.model,
            size: eq.size,
            sku: (eq as any).sku,
            color: (eq as any).color
        }))
    };
}

// --- RPC Getters ---

/**
 * Fetch revenue data for a single event without loading full relations
 */
export async function getEventTransaction(
    supabase: SupabaseClient,
    eventId: string
): Promise<EventTransaction> {
    const { data, error } = await supabase
        .rpc('get_event_transaction', { p_event_id: eventId })
        .single();

    if (error) {
        throw new Error(`Failed to fetch event transaction: ${error.message}`);
    }

    return data;
}

/**
 * Fetch revenue data for multiple events
 */
export async function getEventTransactions(
    supabase: SupabaseClient,
    eventIds: string[]
): Promise<EventTransaction[]> {
    const { data, error } = await supabase
        .rpc('get_event_transactions_batch', { 
            p_event_ids: eventIds 
        });

    if (error) {
        throw new Error(`Failed to fetch event transactions: ${error.message}`);
    }

    return data || [];
}

/**
 * Fetch all event transactions for a booking
 */
export async function getBookingEventTransactions(
    supabase: SupabaseClient,
    bookingId: string
): Promise<EventTransaction[]> {
    const { data, error } = await supabase
        .rpc('get_booking_event_transactions', { 
            p_booking_id: bookingId 
        });

    if (error) {
        throw new Error(`Failed to fetch booking event transactions: ${error.message}`);
    }

    return data || [];
}
