/**
 * Event getter functions for classboard events
 * Pure functions for event formatting and display calculations
 * Note: Queue state and gap detection moved to queue-getter.ts
 */

import type { EventNode } from "@/backend/TeacherQueue";
import type { EventModel } from "@/backend/models";
import { getMinutesFromISO, minutesToTime } from "./queue-getter";
import { calculateCommission } from "./commission-calculator";

/**
 * Get event end time as HH:MM string
 *
 * @param event - Event node
 * @returns End time in HH:MM format (e.g., "13:00")
 */
export function getEventEndTime(event: EventNode): string {
    const startMinutes = getMinutesFromISO(event.eventData.date);
    const endMinutes = startMinutes + event.eventData.duration;
    return minutesToTime(endMinutes);
}

/**
 * Get event time range as string
 *
 * @param event - Event node
 * @returns Time range (e.g., "11:30 - 13:00")
 */
export function getEventTimeRange(event: EventNode): string {
    const startTime = getMinutesFromISO(event.eventData.date);
    const endTime = getEventEndTime(event);
    return `${minutesToTime(startTime)} - ${endTime}`;
}

/**
 * Event revenue calculations for databoard
 */
export class EventStats {
	/**
	 * Calculate total money students paid
	 * Formula: capacity of students * price per student
	 */
	static getStudentsPaid(event: EventModel): number {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		const schoolPackage = booking?.studentPackage?.schoolPackage;

		if (!schoolPackage) return 0;

		const capacityStudents = schoolPackage.capacityStudents || 0;
		const pricePerStudent = schoolPackage.pricePerStudent || 0;

		return capacityStudents * pricePerStudent;
	}

	/**
	 * Calculate teacher commission for this event
	 * Based on event duration and teacher's commission rate
	 */
	static getTeacherCommission(event: EventModel): number {
		const lesson = event.relations?.lesson;
		const commission = lesson?.commission;
		const duration = event.schema.duration || 0;

		if (!commission) return 0;

		const lessonRevenue = this.getStudentsPaid(event);
		const packageDurationMinutes = lesson?.booking?.studentPackage?.schoolPackage?.durationMinutes || 0;

		const commissionCalculation = calculateCommission(duration, commission, lessonRevenue, packageDurationMinutes);
		return commissionCalculation.earned;
	}

	/**
	 * Calculate revenue for this event
	 * Formula: total students paid - teacher commission
	 */
	static getRevenue(event: EventModel): number {
		const studentsPaid = this.getStudentsPaid(event);
		const teacherCommission = this.getTeacherCommission(event);

		return studentsPaid - teacherCommission;
	}

	/**
	 * Get teacher name from event
	 */
	static getTeacherName(event: EventModel): string {
		const lesson = event.relations?.lesson;
		const teacher = lesson?.teacher;

		if (!teacher) return "No teacher";

		return `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || teacher.username;
	}

	/**
	 * Get number of enrolled students from event
	 */
	static getEnrolledStudentsCount(event: EventModel): number {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		const bookingStudents = booking?.bookingStudents || [];

		return bookingStudents.length;
	}

	/**
	 * Get student capacity from school package
	 */
	static getStudentCapacity(event: EventModel): number {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		const schoolPackage = booking?.studentPackage?.schoolPackage;

		return schoolPackage?.capacityStudents || 0;
	}

	/**
	 * Get package description
	 */
	static getPackageDescription(event: EventModel): string {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		const schoolPackage = booking?.studentPackage?.schoolPackage;

		return schoolPackage?.description || "No package";
	}

	/**
	 * Get leader student name from event
	 */
	static getLeaderStudentName(event: EventModel): string {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		return booking?.leaderStudentName || "No leader";
	}

	/**
	 * Get all student names from event as a string
	 */
	static getStudentNames(event: EventModel): string[] {
		const lesson = event.relations?.lesson;
		const booking = lesson?.booking;
		const bookingStudents = booking?.bookingStudents || [];
		if (bookingStudents.length === 0) return [];
		return bookingStudents.map((bs) => (bs.student ? `${bs.student.firstName} ${bs.student.lastName}` : "Unknown"));
	}
}
