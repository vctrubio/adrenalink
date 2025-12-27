"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import {
    student,
    teacher,
    booking,
    equipment,
    studentPackage,
    schoolPackage,
    referral,
    rental,
    event,
} from "@/drizzle/schema";
import {
    createStudentModel,
    createTeacherModel,
    createBookingModel,
    createEquipmentModel,
    createStudentPackageModel,
    createSchoolPackageModel,
    createReferralModel,
    createRentalModel,
    createEventModel,
    type StudentModel,
    type TeacherModel,
    type BookingModel,
    type EquipmentModel,
    type StudentPackageModel,
    type SchoolPackageModel,
    type ReferralModel,
    type RentalModel,
    type EventModel,
} from "@/backend/models";
import {
    buildStudentStatsQuery,
    buildTeacherStatsQuery,
    buildBookingStatsQuery,
    buildEquipmentStatsQuery,
    buildStudentPackageStatsQuery,
    buildSchoolPackageStatsQuery,
    buildReferralStatsQuery,
    buildEventStatsQuery,
    createStatsMap,
} from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

type EntityType = StudentModel | TeacherModel | BookingModel | EquipmentModel | StudentPackageModel | SchoolPackageModel | ReferralModel | RentalModel | EventModel;

// Entity relation configurations
const entityRelations = {
    student: {
        schoolStudents: {
            with: {
                school: true,
            },
        },
        studentPackageStudents: {
            with: {
                studentPackage: {
                    with: {
                        schoolPackage: true,
                    },
                },
            },
        },
        bookingStudents: {
            with: {
                booking: {
                    with: {
                        lessons: {
                            with: {
                                teacher: true,
                                events: true,
                                commission: true,
                            },
                        },
                        studentPackage: {
                            with: {
                                schoolPackage: true,
                                referral: true,
                            },
                        },
                        bookingStudents: {
                            with: {
                                student: true,
                            },
                        },
                        studentBookingPayments: true,
                    },
                },
            },
        },
        bookingPayments: true,
    },
    teacher: {
        school: true,
        lessons: {
            with: {
                events: true,
                commission: true,
                teacherLessonPayments: true,
                booking: {
                    with: {
                        lessons: {
                            with: {
                                teacher: true,
                                events: true,
                            },
                        },
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
                    },
                },
            },
        },
        commissions: true,
    },
    booking: {
        lessons: {
            with: {
                teacher: true,
                events: {
                    with: {
                        equipmentEvents: {
                            with: {
                                equipment: true,
                            },
                        },
                    },
                },
                commission: true,
                teacherLessonPayments: true,
            },
        },
        bookingStudents: {
            with: {
                student: true,
            },
        },
        studentPackage: {
            with: {
                schoolPackage: true,
                referral: true,
            },
        },
        studentBookingPayments: true,
    },
    equipment: {
        teacherEquipments: {
            with: {
                teacher: {
                    with: {
                        lessons: {
                            with: {
                                events: true,
                            },
                        },
                    },
                },
            },
        },
        rentals: {
            with: {
                student: true,
            },
        },
        equipmentEvents: {
            with: {
                event: {
                    with: {
                        lesson: {
                            with: {
                                booking: {
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
                                    },
                                },
                                commission: true,
                            },
                        },
                    },
                },
            },
        },
        equipmentRepairs: true,
    },
    studentPackage: {
        schoolPackage: true,
        studentPackageStudents: {
            with: {
                student: true,
            },
        },
        bookings: true,
    },
    schoolPackage: {
        school: true,
        studentPackages: {
            with: {
                studentPackageStudents: {
                    with: {
                        student: true,
                    },
                },
                referral: true,
                bookings: {
                    with: {
                        lessons: {
                            with: {
                                teacher: true,
                                commission: true,
                                events: true,
                            },
                        },
                        bookingStudents: {
                            with: {
                                student: true,
                            },
                        },
                    },
                },
            },
        },
    },
    referral: {
        school: true,
        studentPackages: true,
    },
    rental: {
        student: true,
        equipment: true,
    },
    event: {
        lesson: {
            with: {
                booking: {
                    with: {
                        studentPackage: {
                            with: {
                                schoolPackage: true
                            }
                        },
                        bookingStudents: {
                            with: {
                                student: true
                            }
                        }
                    }
                },
                teacher: true,
            }
        },
        equipmentEvents: {
            with: {
                equipment: true
            }
        }
    }
};

export async function getEntityId(
    entity: string,
    id: string,
): Promise<ApiActionResponseModel<EntityType>> {
    console.log(`getEntityId: Called with entity='${entity}', id='${id}'`);
    try {
        let entityData: any;
        let statsQuery: any;
        let createModel: (data: any) => EntityType;
        let schoolId: string | undefined;
        let schoolHeader;

        // 1. Fetch entity with appropriate relations
        switch (entity) {
            case "student":
                schoolHeader = await getSchoolHeader();
                if (!schoolHeader) {
                    return { success: false, error: "School context not found" };
                }
                schoolId = schoolHeader.id;

                const studentData = await db.query.student.findFirst({
                    where: eq(student.id, id),
                    with: entityRelations.student,
                });

                if (studentData) {
                    // Filter schoolStudents to only include the current school
                    const filteredSchoolStudents = studentData.schoolStudents?.filter((ss) => ss.schoolId === schoolId) || [];

                    // Check if student belongs to this school
                    if (filteredSchoolStudents.length === 0) {
                        return { success: false, error: "Student not found in this school" };
                    }

                    // Filter bookingStudents to only include bookings from the current school
                    const filteredBookingStudents = studentData.bookingStudents?.filter((bs: any) => {
                        return bs.booking?.studentPackage?.schoolPackage?.schoolId === schoolId;
                    }) || [];

                    // Filter bookingPayments to only include payments for bookings from the current school
                    const filteredBookingPayments = studentData.bookingPayments?.filter((bp: any) => {
                        return filteredBookingStudents.some((bs: any) => bs.bookingId === bp.bookingId);
                    }) || [];

                    console.log("=== STUDENT DATA DEBUG ===");
                    console.log("Student ID:", studentData.id);
                    console.log("School ID from header:", schoolId);
                    console.log("Total bookingStudents:", studentData.bookingStudents?.length);
                    console.log("Filtered bookingStudents:", filteredBookingStudents.length);
                    console.log("Total bookingPayments:", studentData.bookingPayments?.length);
                    console.log("Filtered bookingPayments:", filteredBookingPayments.length);
                    console.log("bookingPayments data:", JSON.stringify(filteredBookingPayments, null, 2));
                    console.log("bookingStudents with booking:", JSON.stringify(filteredBookingStudents.map((bs: any) => ({
                        bookingId: bs.bookingId,
                        bookingStatus: bs.booking?.status,
                        lessonsCount: bs.booking?.lessons?.length,
                        firstLessonEvents: bs.booking?.lessons?.[0]?.events?.length,
                        schoolPackageId: bs.booking?.studentPackage?.schoolPackage?.schoolId,
                    })), null, 2));

                    entityData = {
                        ...studentData,
                        schoolStudents: filteredSchoolStudents,
                        bookingStudents: filteredBookingStudents,
                        bookingPayments: filteredBookingPayments,
                    };
                }

                statsQuery = buildStudentStatsQuery();
                createModel = (data: any) => createStudentModel(data, schoolId);
                break;

            case "teacher":
                entityData = await db.query.teacher.findFirst({
                    where: eq(teacher.id, id),
                    with: entityRelations.teacher,
                });
                statsQuery = buildTeacherStatsQuery();
                createModel = createTeacherModel;
                break;

            case "booking":
                entityData = await db.query.booking.findFirst({
                    where: eq(booking.id, id),
                    with: entityRelations.booking,
                });
                statsQuery = buildBookingStatsQuery();
                createModel = createBookingModel;
                break;

            case "equipment":
                entityData = await db.query.equipment.findFirst({
                    where: eq(equipment.id, id),
                    with: entityRelations.equipment,
                });
                statsQuery = buildEquipmentStatsQuery();
                createModel = createEquipmentModel;
                break;

            case "studentPackage":
                entityData = await db.query.studentPackage.findFirst({
                    where: eq(studentPackage.id, id),
                    with: entityRelations.studentPackage,
                });
                statsQuery = buildStudentPackageStatsQuery();
                createModel = createStudentPackageModel;
                break;

            case "schoolPackage":
                entityData = await db.query.schoolPackage.findFirst({
                    where: eq(schoolPackage.id, id),
                    with: entityRelations.schoolPackage,
                });
                statsQuery = buildSchoolPackageStatsQuery();
                createModel = createSchoolPackageModel;
                break;

            case "referral":
                entityData = await db.query.referral.findFirst({
                    where: eq(referral.id, id),
                    with: entityRelations.referral,
                });
                statsQuery = buildReferralStatsQuery();
                createModel = createReferralModel;
                break;

            case "rental":
                entityData = await db.query.rental.findFirst({
                    where: eq(rental.id, id),
                    with: entityRelations.rental,
                });
                statsQuery = buildEquipmentStatsQuery();
                createModel = createRentalModel;
                break;

            case "event":
                entityData = await db.query.event.findFirst({
                    where: eq(event.id, id),
                    with: entityRelations.event,
                });
                statsQuery = buildEventStatsQuery();
                createModel = createEventModel;
                break;

            default:
                return { success: false, error: `Unknown entity type: ${entity}` };
        }

        if (!entityData) {
            return { success: false, error: `${entity} not found` };
        }

        // 2. Fetch stats
        const statsResult = await db.execute(statsQuery);

        // 3. Create stats map
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Create model with stats
        // For teachers and students, use entity.id (UUID) not the id parameter (username/id)
        const statsKey = entity === "teacher" || entity === "student" ? entityData.id : id;
        const model: EntityType = {
            ...createModel(entityData),
            stats: statsMap.get(statsKey),
        };
        console.log(`getEntityId: Returning data for entity='${entity}', id='${id}':`, model);
        return { success: true, data: model };
    } catch (error) {
        console.error(`Error fetching ${entity}:`, error);
        return { success: false, error: `Failed to fetch ${entity}` };
    }
}
