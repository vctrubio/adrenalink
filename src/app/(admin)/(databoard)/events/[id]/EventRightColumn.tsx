"use client";

import { EventTeacherCard } from "@/src/portals/EventTeacherCard";
import { EventStudentCard } from "@/src/portals/EventStudentCard";
import { EventStats } from "@/getters/event-getter";
import { formatDate } from "@/getters/date-getter";
import type { EventModel } from "@/backend/models";

export function EventRightColumn({ event }: { event: EventModel }) {
	const lesson = event.relations?.lesson;
	const teacher = lesson?.teacher;
	const booking = lesson?.booking;
	const schoolPackage = booking?.studentPackage?.schoolPackage;
	const bookingStudents = booking?.bookingStudents || [];

	const teacherName = EventStats.getTeacherName(event);
	const packageDesc = EventStats.getPackageDescription(event);
	const capacity = EventStats.getStudentCapacity(event);

	// Prepare student names for teacher card
	const studentNames = bookingStudents.map((bs) => {
		const student = bs.student;
		if (!student) return "Unknown";
		return `${student.firstName || ""} ${student.lastName || ""}`.trim();
	});

	// Prepare teacher data for student card
	const teacherFullName = teacher
		? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || teacher.username
		: "No teacher";

	return (
		<div className="space-y-6">
			{/* Teacher View Card */}
			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-3">Teacher View</h3>
				<EventTeacherCard
					students={studentNames}
					location={event.schema.location || "TBD"}
					date={event.schema.date}
					duration={event.schema.duration || 0}
					capacity={capacity}
					packageDescription={packageDesc}
					pricePerHour={schoolPackage?.pricePerStudent || 0}
					status={event.schema.status}
					categoryEquipment={schoolPackage?.categoryEquipment}
					capacityEquipment={schoolPackage?.capacityEquipment}
				/>
			</div>

			{/* Student View Card */}
			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-3">Student View</h3>
				<EventStudentCard
					teacherName={teacherFullName}
					location={event.schema.location || "TBD"}
					date={event.schema.date}
					duration={event.schema.duration || 0}
					capacity={capacity}
					packageDescription={packageDesc}
					pricePerHour={schoolPackage?.pricePerStudent || 0}
					status={event.schema.status}
					categoryEquipment={schoolPackage?.categoryEquipment}
					capacityEquipment={schoolPackage?.capacityEquipment}
				/>
			</div>

			{/* Classboard Event Card View */}
			<div>
				<h3 className="text-sm font-medium text-muted-foreground mb-3">Classboard View</h3>
				<div className="bg-card border border-border rounded-lg p-4">
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Date</span>
							<span className="text-sm text-muted-foreground">{formatDate(event.schema.date)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Time</span>
							<span className="text-sm text-muted-foreground">
								{new Date(event.schema.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Duration</span>
							<span className="text-sm text-muted-foreground">{event.schema.duration} minutes</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Location</span>
							<span className="text-sm text-muted-foreground">{event.schema.location || "TBD"}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-foreground">Status</span>
							<span className="text-sm text-muted-foreground">{event.schema.status}</span>
						</div>
						{studentNames.length > 0 && (
							<div className="pt-3 border-t border-border">
								<p className="text-sm font-medium text-foreground mb-2">Students</p>
								<div className="space-y-1">
									{studentNames.map((name, idx) => (
										<p key={idx} className="text-sm text-muted-foreground">
											{name}
										</p>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
