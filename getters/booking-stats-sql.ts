"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { booking } from "@/drizzle/schema";
import type { ActiveBookingModel } from "@/backend/models/ActiveBookingModel";

/**
 * Fetch all active bookings with related data using Drizzle relations
 * Returns structured data ready to be mapped to ActiveBookingModel
 */
export async function getActiveBookingsWithStats() {
	try {
		const activeBookings = await db.query.booking.findMany({
			where: eq(booking.status, "active"),
			with: {
				studentPackage: {
					with: {
						schoolPackage: true,
					},
				},
				bookingStudents: {
					with: {
						student: true,
					},
				},
				lessons: {
					with: {
						teacher: true,
						commission: true,
						events: true,
					},
				},
			},
		});

		// Build ActiveBookingModel instances
		const activeBookingModels: ActiveBookingModel[] = activeBookings.map((b) => {
			// Validate required relations exist
			if (!b.studentPackage) {
				throw new Error(`Booking ${b.id} missing required studentPackage relation`);
			}
			if (!b.studentPackage.schoolPackage) {
				throw new Error(`Booking ${b.id} missing required schoolPackage relation on studentPackage`);
			}

			const schoolPackage = b.studentPackage.schoolPackage;

			// Extract students from bookingStudents relation
			const students = b.bookingStudents.map((bs) => ({
				id: bs.student.id,
				firstName: bs.student.firstName,
				lastName: bs.student.lastName,
			}));

			// Extract unique teachers and calculate total event duration
			const uniqueTeachers = new Set<string>();
			let totalEventDuration = 0;

			const events = b.lessons.flatMap((lesson_item) => {
				uniqueTeachers.add(lesson_item.teacherId);
				totalEventDuration += lesson_item.events.reduce((sum, evt) => sum + evt.duration, 0);
				return lesson_item.events.map((evt) => ({
					id: evt.id,
					duration: evt.duration,
					date: evt.date,
					status: evt.status as "planned" | "tbc" | "completed" | "uncompleted",
					teacher: lesson_item.teacher ? {
						id: lesson_item.teacher.id,
						firstName: lesson_item.teacher.firstName,
						lastName: lesson_item.teacher.lastName,
						username: lesson_item.teacher.username,
					} : undefined,
					commission: lesson_item.commission ? {
						type: lesson_item.commission.commissionType as "fixed" | "percentage",
						cph: Number(lesson_item.commission.cph),
					} : undefined,
				}));
			});

			const packageDuration = schoolPackage.durationMinutes;
			const completionPercentage =
				packageDuration > 0 ? (totalEventDuration / packageDuration) * 100 : 0;

			return {
				id: b.id,
				status: b.status,
				dateStart: b.dateStart,
				dateEnd: b.dateEnd,
				package: {
					id: schoolPackage.id,
					description: schoolPackage.description,
					durationMinutes: packageDuration,
					pricePerStudent: schoolPackage.pricePerStudent,
					capacityStudents: schoolPackage.capacityStudents,
					categoryEquipment: schoolPackage.categoryEquipment,
				},
				students,
				events,
				studentPayments: [], // TODO: Add payment data when available
				totalEventDuration,
				uniqueTeacherCount: uniqueTeachers.size,
				completionPercentage,
			};
		});

		return activeBookingModels;
	} catch (error) {
		console.error("Error fetching active bookings with stats:", error);
		return [];
	}
}
