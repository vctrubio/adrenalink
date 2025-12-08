"use client";

import { useState, useMemo } from "react";
import { EventStudentCard } from "@/src/portals/EventStudentCard";

interface EventsFilterProps {
	events: any[];
}

type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "planned" | "tbc" | "completed" | "uncompleted";

export function EventsFilter({ events }: EventsFilterProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

	const filteredAndSortedEvents = useMemo(() => {
		let filtered = events;

		// Filter by status
		if (statusFilter !== "all") {
			filtered = filtered.filter((event) => event.status === statusFilter);
		}

		// Sort by date
		const sorted = [...filtered].sort((a, b) => {
			const dateA = new Date(a.date).getTime();
			const dateB = new Date(b.date).getTime();
			return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
		});

		return sorted;
	}, [events, statusFilter, sortOrder]);

	return (
		<div>
			{/* Filters */}
			<div className="flex gap-4 mb-6">
				<div className="flex gap-2">
					<label className="text-sm font-medium text-foreground">Status:</label>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
						className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm"
					>
						<option value="all">All</option>
						<option value="planned">Planned</option>
						<option value="tbc">TBC</option>
						<option value="completed">Completed</option>
						<option value="uncompleted">Uncompleted</option>
					</select>
				</div>

				<div className="flex gap-2">
					<label className="text-sm font-medium text-foreground">Sort:</label>
					<select
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value as SortOrder)}
						className="px-3 py-1 rounded-lg border border-border bg-background text-foreground text-sm"
					>
						<option value="desc">Newest First</option>
						<option value="asc">Oldest First</option>
					</select>
				</div>
			</div>

			{/* Events Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filteredAndSortedEvents.map((event) => (
					<EventStudentCard
						key={event.id}
						teacherName={`${event.teacher?.firstName || ""} ${event.teacher?.lastName || ""}`.trim()}
						location={event.location || "TBD"}
						date={event.date}
						duration={event.duration}
						capacity={event.schoolPackage?.capacityStudents || 0}
						packageDescription={event.schoolPackage?.description || ""}
						pricePerHour={event.schoolPackage?.pricePerStudent || 0}
						status={event.status}
						categoryEquipment={event.schoolPackage?.categoryEquipment}
						capacityEquipment={event.schoolPackage?.capacityEquipment}
					/>
				))}
			</div>

			{filteredAndSortedEvents.length === 0 && (
				<p className="text-muted-foreground text-center py-8">
					No events found with selected filters
				</p>
			)}
		</div>
	);
}
