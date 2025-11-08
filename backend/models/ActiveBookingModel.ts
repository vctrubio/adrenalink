import type { BookingStatus } from "@/drizzle/schema";

export interface ActiveBookingModel {
	id: string;
	status: BookingStatus;
	dateStart: Date;
	dateEnd: Date;

	// Package Info (to derive equipment icon)
	package: {
		id: string;
		description: string | null;
		durationMinutes: number;
		pricePerStudent: number;
		capacityStudents: number;
		categoryEquipment: "kite" | "wing" | "windsurf";
	};

	// Students in this booking
	students: Array<{
		id: string;
		firstName: string;
		lastName: string;
	}>;

	// Events (lessons/sessions with durations)
	events: Array<{
		id: string;
		duration: number;
		date: Date;
		status: "planned" | "tbc" | "completed" | "uncompleted";
		teacher?: {
			id: string;
			firstName: string;
			lastName: string;
		};
		commission?: {
			type: "fixed" | "percentage";
			cph: number; // Commission per hour
		};
	}>;

	// Student payments
	studentPayments: Array<{
		id: string;
		amount: number;
		studentId: string;
	}>;

	// Computed values
	totalEventDuration: number; // Sum of all event durations in minutes
	uniqueTeacherCount: number; // Count of unique teachers from lessons
	completionPercentage: number; // (totalEventDuration / durationMinutes) * 100
}
