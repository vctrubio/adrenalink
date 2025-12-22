"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { updateEvent } from "@/actions/events-action";
import { formatDate } from "@/getters/date-getter";
import { getPrettyDuration } from "@/getters/duration-getter";
import { EventStats } from "@/getters/event-getter";
import { EVENT_STATUS_CONFIG, type EventStatus } from "@/types/status";
import type { EventModel } from "@/backend/models";
import { SingleDatePicker } from "@/src/components/pickers/SingleDatePicker";

function EventViewMode({ event, onEdit }: { event: EventModel; onEdit: () => void }) {
	const eventEntity = ENTITY_DATA.find((e) => e.id === "event")!;
	const packageDesc = EventStats.getPackageDescription(event);
	const studentsPaid = EventStats.getStudentsPaid(event);
	const teacherCommission = EventStats.getTeacherCommission(event);
	const revenue = EventStats.getRevenue(event);

	return (
		<>
			{/* Buttons */}
			<div className="flex items-center gap-2">
				<button
					onClick={onEdit}
					style={{ borderColor: eventEntity.color }}
					className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap hover:bg-muted/50 transition-colors"
				>
					Edit
				</button>
			</div>

			{/* Content */}
			<div className="space-y-4 text-sm">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-muted-foreground mb-1">Status</p>
						<p className="font-medium text-foreground">{EVENT_STATUS_CONFIG[event.schema.status]?.label || event.schema.status}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-1">Duration</p>
						<p className="font-medium text-foreground">{getPrettyDuration(event.schema.duration || 0)}</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<p className="text-xs text-muted-foreground mb-1">Location</p>
						<p className="font-medium text-foreground">{event.schema.location || "TBD"}</p>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-1">Package</p>
						<p className="font-medium text-foreground">{packageDesc}</p>
					</div>
				</div>

				<div className="border-t border-border pt-4 mt-4">
					<p className="text-xs text-muted-foreground mb-3">Financial Summary</p>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-muted-foreground">Students Paid</span>
							<span className="font-medium text-foreground">€{studentsPaid.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">Teacher Commission</span>
							<span className="font-medium text-foreground">€{teacherCommission.toFixed(2)}</span>
						</div>
						<div className="flex justify-between pt-2 border-t border-border">
							<span className="font-medium text-foreground">Revenue</span>
							<span className="font-bold text-foreground" style={{ color: revenue >= 0 ? "#10b981" : "#ef4444" }}>
								€{revenue.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function EventEditMode({ event, onCancel, onSubmit }: { event: EventModel; onCancel: () => void; onSubmit: (data: any) => Promise<void> }) {
	const initialFormData = {
		date: event.schema.date,
		duration: event.schema.duration || 0,
		location: event.schema.location || "",
		status: event.schema.status,
	};

	const [formData, setFormData] = useState(initialFormData);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

	const handleReset = () => {
		setFormData(initialFormData);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			await onSubmit(formData);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			{/* Buttons */}
			<div className="flex items-center gap-2">
				<button
					onClick={onCancel}
					disabled={isSubmitting}
					className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
				>
					Cancel
				</button>
				<button
					onClick={handleReset}
					disabled={!hasChanges || isSubmitting}
					className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
				>
					Reset
				</button>
				<button
					onClick={handleSubmit}
					disabled={!hasChanges || isSubmitting}
					style={{ borderColor: eventEntity.color }}
					className="px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors disabled:opacity-50"
					onMouseEnter={(e) => {
						e.currentTarget.style.backgroundColor = `${eventEntity.color}15`;
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = "transparent";
					}}
				>
					{isSubmitting ? "Saving..." : "Save Changes"}
				</button>
			</div>

			{/* Form */}
			<div className="space-y-4">
				<div>
					<label className="text-xs font-medium text-muted-foreground">Date</label>
					<SingleDatePicker
						selectedDate={formData.date}
						onDateChange={(date) => setFormData({ ...formData, date })}
						allowPastDates={true}
					/>
				</div>

				<div>
					<label className="text-xs font-medium text-muted-foreground">Duration (minutes)</label>
					<input
						type="number"
						value={formData.duration}
						onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
						className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						placeholder="60"
					/>
				</div>

				<div>
					<label className="text-xs font-medium text-muted-foreground">Location</label>
					<input
						type="text"
						value={formData.location}
						onChange={(e) => setFormData({ ...formData, location: e.target.value })}
						className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						placeholder="Beach, Lake, etc."
					/>
				</div>

				<div>
					<label className="text-xs font-medium text-muted-foreground">Status</label>
					<select
						value={formData.status}
						onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
						className="w-full h-10 mt-1 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					>
						<option value="planned">Planned</option>
						<option value="tbc">TBC</option>
						<option value="completed">Completed</option>
						<option value="uncompleted">Uncompleted</option>
					</select>
				</div>
			</div>
		</>
	);
}

export function EventLeftColumn({ event, className }: { event: EventModel; className?: string }) {
	const [isEditing, setIsEditing] = useState(false);

	const handleSubmit = async (formData: any) => {
		const result = await updateEvent(event.schema.id, formData);
		if (result.success) {
			setIsEditing(false);
		} else {
			console.error("Error updating event:", result.error);
		}
	};

	const content = isEditing ? (
		<EventEditMode event={event} onCancel={() => setIsEditing(false)} onSubmit={handleSubmit} />
	) : (
		<EventViewMode event={event} onEdit={() => setIsEditing(true)} />
	);

	return <div className={`space-y-4 ${className || ""}`.trim()}>{content}</div>;
}
