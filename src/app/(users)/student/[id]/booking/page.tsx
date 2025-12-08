import { getStudentBookings } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";

interface BookingPageProps {
	params: Promise<{ id: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
	const { id: studentId } = await params;

	// Get school from subdomain header
	const schoolHeader = await getSchoolHeader();
	const schoolId = schoolHeader?.id;

	const result = await getStudentBookings(studentId, schoolId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const bookings = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Bookings</h2>

			{bookings.length === 0 ? (
				<p className="text-muted-foreground">No bookings found</p>
			) : (
				<div className="space-y-3">
					{bookings.map((booking) => {
						const schoolPackage = booking.relations?.studentPackage?.relations?.schoolPackage;
						const students = booking.relations?.bookingStudents || [];
						const startDate = new Date(booking.schema.dateStart);
						const endDate = new Date(booking.schema.dateEnd);

						return (
							<div
								key={booking.schema.id}
								className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-bold text-foreground">
												{schoolPackage?.name || "Booking"}
											</h3>
											<span
												className="text-xs px-2 py-1 rounded-full"
												style={{
													backgroundColor: `${booking.schema.status === "active" ? "#22c55e" : "#ef4444"}20`,
													color: booking.schema.status === "active" ? "#22c55e" : "#ef4444",
												}}
											>
												{booking.schema.status}
											</span>
										</div>
										<div className="text-sm text-muted-foreground space-y-1">
											<p>
												Dates:{" "}
												{startDate.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
												})}{" "}
												-{" "}
												{endDate.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</p>
											<p>
												Package Duration:{" "}
												{schoolPackage?.durationMinutes || 0} minutes
											</p>
											<p>Students: {students.length}</p>
										</div>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-foreground">
											${schoolPackage?.pricePerStudent || 0}
										</div>
										<p className="text-xs text-muted-foreground">per student</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
