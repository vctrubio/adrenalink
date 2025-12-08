import { getStudentRequests } from "@/actions/student-action";
import { getSchoolHeader } from "@/types/headers";

interface RequestPageProps {
	params: Promise<{ id: string }>;
}

export default async function RequestPage({ params }: RequestPageProps) {
	const { id: studentId } = await params;

	// Get school from subdomain header
	const schoolHeader = await getSchoolHeader();
	const schoolId = schoolHeader?.id;

	const result = await getStudentRequests(studentId, schoolId);

	if (!result.success) {
		return (
			<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
				Error: {result.error}
			</div>
		);
	}

	const packages = result.data;

	return (
		<div>
			<h2 className="text-xl font-bold text-foreground mb-4">My Package Requests</h2>

			{packages.length === 0 ? (
				<p className="text-muted-foreground">No package requests found</p>
			) : (
				<div className="space-y-3">
					{packages.map((pkg) => {
						const schoolPackage = pkg.relations?.schoolPackage;
						const createdDate = new Date(pkg.schema.createdAt);
						const startDate = new Date(pkg.schema.requestedDateStart);
						const endDate = new Date(pkg.schema.requestedDateEnd);

						return (
							<div
								key={pkg.schema.id}
								className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<h3 className="font-bold text-foreground">
												{schoolPackage?.description || "Package Request"}
											</h3>
											<span
												className="text-xs px-2 py-1 rounded-full font-medium"
												style={{
													backgroundColor:
														pkg.schema.status === "accepted"
															? "#22c55e20"
															: pkg.schema.status === "rejected"
																? "#ef444420"
																: "#f59e0b20",
													color:
														pkg.schema.status === "accepted"
															? "#22c55e"
															: pkg.schema.status === "rejected"
																? "#ef4444"
																: "#f59e0b",
												}}
											>
												{pkg.schema.status}
											</span>
										</div>
										<div className="text-sm text-muted-foreground space-y-1">
											<p>
												Package Type:{" "}
												<span className="text-foreground font-medium">
													{schoolPackage?.packageType}
												</span>
											</p>
											<p>
												Duration:{" "}
												<span className="text-foreground font-medium">
													{schoolPackage?.durationMinutes} minutes
												</span>
											</p>
											<p>
												Requested:{" "}
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
												Requested On:{" "}
												{createdDate.toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
													year: "numeric",
												})}
											</p>
										</div>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-foreground">
											${schoolPackage?.pricePerStudent || 0}
										</div>
										<p className="text-xs text-muted-foreground">per student</p>
										{schoolPackage?.capacityStudents && (
											<p className="text-xs text-muted-foreground mt-2">
												{schoolPackage.capacityStudents} students max
											</p>
										)}
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
