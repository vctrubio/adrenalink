"use client";

import { useEffect, useRef } from "react";
import { getClientConnection as createClient } from "@/supabase/connection";
import { useSchoolCredentials } from "@/src/providers/school-credentials-provider";
import type { StudentPackageRequest } from "@/supabase/server/student-package";

interface AdminReservationPackageListenerOptions {
    onPackageDetected: (data: StudentPackageRequest[]) => void;
    onPackageUpdate?: (payload: {
        eventType: "INSERT" | "UPDATE" | "DELETE";
        packageId: string;
        status?: string;
        requestedClerkId?: string;
    }) => void;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export function useAdminReservationPackageListener({
    onPackageDetected,
    onPackageUpdate,
}: AdminReservationPackageListenerOptions) {
    const credentials = useSchoolCredentials();
    const schoolId = credentials?.id || "";
    const retryCountRef = useRef(0);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!schoolId || schoolId.length === 0) {
            console.log("[RESERVATION-LISTENER] ⚠️ Listener not started: School ID is missing");
            return;
        }

        console.log("[RESERVATION-LISTENER] 🚀 Opening listener...", {
            schoolId,
            table: "student_package",
            channel: `reservation_package_activity_${schoolId}`,
        });

        const setupSubscription = () => {
            try {
                const supabase = createClient();
                
                console.log("[RESERVATION-LISTENER] 📡 Setting up subscription on table: student_package", {
                    schoolId,
                    events: ["INSERT", "UPDATE", "DELETE"],
                });

                const handleTableChange = async (payload: any) => {
                    console.log("[RESERVATION-LISTENER] 📢 Table change detected:", {
                        event: payload.eventType,
                        table: payload.table,
                        schoolId,
                        new: payload.new,
                        old: payload.old,
                    });

                    const studentPackageId = payload.new?.id || payload.old?.id;
                    const schoolPackageId = payload.new?.school_package_id || payload.old?.school_package_id;
                    const newStatus = payload.new?.status;
                    const oldStatus = payload.old?.status;

                    console.log("[RESERVATION-LISTENER] 📋 Change details:", {
                        studentPackageId,
                        schoolPackageId,
                        statusChange: oldStatus !== newStatus ? `${oldStatus} → ${newStatus}` : "no status change",
                        eventType: payload.eventType,
                    });

                    // ZERO-FETCH PATH: If onPackageUpdate callback is provided, use direct payload
                    if (onPackageUpdate && studentPackageId) {
                        console.log("[RESERVATION-LISTENER] ✅ Using zero-fetch path - direct payload update");
                        onPackageUpdate({
                            eventType: payload.eventType as "INSERT" | "UPDATE" | "DELETE",
                            packageId: studentPackageId,
                            status: newStatus || oldStatus,
                            requestedClerkId: payload.new?.requested_clerk_id || payload.old?.requested_clerk_id,
                        });
                    }

                    // For UPDATE events, always refetch since the query filters by school_id anyway
                    // This is more reliable than checking school_package relationship
                    if (payload.eventType === "UPDATE") {
                        console.log("[RESERVATION-LISTENER] 🔄 UPDATE event - refetching invitations (query will filter by school_id)");
                        fetchAndNotify();
                        return;
                    }

                    // For INSERT/DELETE, verify the school_package belongs to this school before refetching
                    if (schoolPackageId) {
                        try {
                            const { data: schoolPackage, error: schoolPackageError } = await supabase
                                .from("school_package")
                                .select("school_id")
                                .eq("id", schoolPackageId)
                                .single();

                            if (schoolPackageError) {
                                console.error("[RESERVATION-LISTENER] ❌ Error checking school_package:", schoolPackageError);
                                // Refetch anyway - query will filter correctly
                                fetchAndNotify();
                                return;
                            }

                            if (schoolPackage && schoolPackage.school_id === schoolId) {
                                console.log(
                                    `[RESERVATION-LISTENER] ✅ Student package belongs to school (${schoolId}), refetching invitations`,
                                );
                                fetchAndNotify();
                            } else {
                                console.log(
                                    `[RESERVATION-LISTENER] ⚠️ Student package does not belong to this school. Package school: ${schoolPackage?.school_id}, Current school: ${schoolId}`,
                                );
                            }
                        } catch (err) {
                            console.error("[RESERVATION-LISTENER] ❌ Exception checking school_package:", err);
                            // Refetch anyway - query will filter correctly
                            fetchAndNotify();
                        }
                    } else {
                        // If we can't determine the school, refetch anyway (safer)
                        console.log(`[RESERVATION-LISTENER] ⚠️ Could not determine school_package_id, refetching anyway`);
                        fetchAndNotify();
                    }
                };

                const fetchAndNotify = async () => {
                    try {
                        // Fetch student package requests directly using Supabase client
                        // This matches the server function logic but works client-side
                        const { data: requests, error: requestsError } = await supabase
                            .from("student_package")
                            .select(
                                `
                                *,
                                school_package!inner(*),
                                referral(*)
                            `,
                            )
                            .eq("school_package.school_id", schoolId)
                            .order("created_at", { ascending: false });

                        if (requestsError) {
                            console.error("[RESERVATION-LISTENER] ❌ Refetch failed:", requestsError);
                            return;
                        }

                        if (!requests || requests.length === 0) {
                            console.log("[RESERVATION-LISTENER] ✅ Refetch successful, no requests found");
                            onPackageDetected([]);
                            return;
                        }

                        // Get all unique clerk_ids from requests
                        const clerkIds = [...new Set(requests.map((r: any) => r.requested_clerk_id).filter(Boolean))];

                        // Fetch FULL student data for all clerk_ids in one query (not just names)
                        const { data: schoolStudents, error: studentsError } = await supabase
                            .from("school_students")
                            .select(
                                `
                                *,
                                student!inner(*)
                            `,
                            )
                            .eq("school_id", schoolId)
                            .in("clerk_id", clerkIds);

                        if (studentsError) {
                            console.error("[RESERVATION-LISTENER] ❌ Error fetching student data:", studentsError);
                            // Continue without data rather than failing
                        }

                        // Create maps of clerk_id -> student data and student name
                        const studentDataMap: Record<string, any> = {};
                        const studentNameMap: Record<string, { firstName: string; lastName: string; fullName: string }> = {};
                        
                        if (schoolStudents) {
                            schoolStudents.forEach((ss: any) => {
                                if (ss.clerk_id && ss.student) {
                                    const firstName = ss.student.first_name || "";
                                    const lastName = ss.student.last_name || "";
                                    
                                    // Store full student data
                                    studentDataMap[ss.clerk_id] = ss;
                                    
                                    // Store name for backward compatibility
                                    studentNameMap[ss.clerk_id] = {
                                        firstName,
                                        lastName,
                                        fullName: `${firstName} ${lastName}`.trim(),
                                    };
                                }
                            });
                        }

                        // Attach student names and full data to each request
                        const requestsWithNames = requests.map((request: any) => ({
                            ...request,
                            student_name: studentNameMap[request.requested_clerk_id] || null,
                            student_data: studentDataMap[request.requested_clerk_id] || null,
                        }));

                        console.log("[RESERVATION-LISTENER] ✅ Refetch successful, updating UI with enriched data");
                        onPackageDetected(requestsWithNames as StudentPackageRequest[]);
                    } catch (err) {
                        console.error("[RESERVATION-LISTENER] ❌ Exception during refetch:", err);
                    }
                };

                const eventChannel = supabase
                    .channel(`reservation_package_activity_${schoolId}`)
                    // --- STUDENT_PACKAGE Table ---
                    .on(
                        "postgres_changes",
                        {
                            event: "INSERT",
                            schema: "public",
                            table: "student_package",
                        },
                        (payload) => {
                            console.log("[RESERVATION-LISTENER] 📥 STUDENT_PACKAGE Insert");
                            handleTableChange(payload);
                        },
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "UPDATE",
                            schema: "public",
                            table: "student_package",
                        },
                        (payload) => {
                            console.log("[RESERVATION-LISTENER] ✏️ STUDENT_PACKAGE Update received", {
                                id: payload.new?.id,
                                status: payload.new?.status,
                                oldStatus: payload.old?.status,
                            });
                            handleTableChange(payload);
                        },
                    )
                    .on(
                        "postgres_changes",
                        {
                            event: "DELETE",
                            schema: "public",
                            table: "student_package",
                        },
                        (payload) => {
                            console.log("[RESERVATION-LISTENER] 🗑️ STUDENT_PACKAGE Delete");
                            handleTableChange(payload);
                        },
                    )
                    .subscribe((status, err) => {
                        console.log(`[RESERVATION-LISTENER] Subscription status: ${status}`, {
                            schoolId,
                            table: "student_package",
                            channel: `reservation_package_activity_${schoolId}`,
                        });
                        if (status === "SUBSCRIBED") {
                            console.log("✅ [RESERVATION-LISTENER] Successfully subscribed to student package changes", {
                                schoolId,
                                table: "student_package",
                                listeningOn: ["INSERT", "UPDATE", "DELETE"],
                            });
                            retryCountRef.current = 0;
                        } else if (status === "CHANNEL_ERROR") {
                            console.error(
                                `❌ [RESERVATION-LISTENER] CHANNEL_ERROR occurred (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`,
                                err,
                            );
                            handleSubscriptionError();
                        } else if (status === "TIMED_OUT") {
                            console.error(
                                `❌ [RESERVATION-LISTENER] TIMED_OUT waiting for subscription (Attempt ${retryCountRef.current + 1}/${MAX_RETRIES})`,
                                err,
                            );
                            handleSubscriptionError();
                        }
                    });

                const handleSubscriptionError = () => {
                    supabase.removeChannel(eventChannel);

                    if (retryCountRef.current < MAX_RETRIES) {
                        retryCountRef.current += 1;
                        console.log(`[RESERVATION-LISTENER] Retrying in ${RETRY_DELAY_MS}ms...`);
                        retryTimeoutRef.current = setTimeout(() => {
                            setupSubscription();
                        }, RETRY_DELAY_MS);
                    } else {
                        console.error(
                            "[RESERVATION-LISTENER] ⚠️ Max retries reached. Real-time updates disabled. Invitations will still work with manual refreshes.",
                        );
                    }
                };

                // Cleanup
                return () => {
                    console.log("[RESERVATION-LISTENER] 🛑 Closing listener", {
                        schoolId,
                        table: "student_package",
                    });
                    supabase.removeChannel(eventChannel);
                    if (retryTimeoutRef.current) {
                        clearTimeout(retryTimeoutRef.current);
                    }
                };
            } catch (error) {
                console.error("[RESERVATION-LISTENER] Error during setup:", error);
            }
        };

        return setupSubscription();
    }, [schoolId, onPackageDetected, onPackageUpdate]);
}
