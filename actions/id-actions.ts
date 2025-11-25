"use server";

import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { getSchoolIdFromHeader } from "@/types/headers";
import {
    student,
    teacher,
    booking,
    equipment,
    studentPackage,
    schoolPackage,
    referral,
    rental,
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
    type StudentModel,
    type TeacherModel,
    type BookingModel,
    type EquipmentModel,
    type StudentPackageModel,
    type SchoolPackageModel,
    type ReferralModel,
    type RentalModel,
} from "@/backend/models";
import {
    buildStudentStatsQuery,
    buildTeacherStatsQuery,
    buildBookingStatsQuery,
    buildEquipmentStatsQuery,
    buildStudentPackageStatsQuery,
    buildSchoolPackageStatsQuery,
    buildReferralStatsQuery,
    createStatsMap,
} from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

type EntityType = StudentModel | TeacherModel | BookingModel | EquipmentModel | StudentPackageModel | SchoolPackageModel | ReferralModel | RentalModel;

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
                            },
                        },
                        studentPackage: {
                            with: {
                                schoolPackage: true,
                            },
                        },
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
                booking: true,
            },
        },
        commissions: true,
    },
    booking: {
        lessons: {
            with: {
                teacher: true,
                events: true,
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
            },
        },
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
                bookings: {
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
    },
    referral: {
        school: true,
        studentPackages: true,
    },
    rental: {
        student: true,
        equipment: true,
    },
};

export async function getEntityId(
    entity: string,
    id: string,
): Promise<ApiActionResponseModel<EntityType>> {
    try {
        let entityData: any;
        let statsQuery: any;
        let createModel: (data: any) => EntityType;

        // 1. Fetch entity with appropriate relations
        switch (entity) {
            case "student":
                const schoolId = await getSchoolIdFromHeader();
                if (!schoolId) {
                    return { success: false, error: "School context not found" };
                }

                const studentData = await db.query.student.findFirst({
                    where: eq(student.id, id),
                    with: entityRelations.student,
                });

                if (studentData) {
                    // Filter schoolStudents to only include the current school
                    const filteredSchoolStudents = studentData.schoolStudents?.filter((ss) => ss.schoolId === schoolId) || [];

                    // Filter bookingStudents to only include bookings from the current school
                    const filteredBookingStudents = studentData.bookingStudents?.filter((bs: any) => {
                        return bs.booking?.studentPackage?.schoolPackage?.schoolId === schoolId;
                    }) || [];

                    // Filter bookingPayments to only include payments for bookings from the current school
                    const filteredBookingPayments = studentData.bookingPayments?.filter((bp: any) => {
                        return filteredBookingStudents.some((bs: any) => bs.bookingId === bp.bookingId);
                    }) || [];

                    entityData = {
                        ...studentData,
                        schoolStudents: filteredSchoolStudents,
                        bookingStudents: filteredBookingStudents,
                        bookingPayments: filteredBookingPayments,
                    };
                }

                statsQuery = buildStudentStatsQuery();
                createModel = createStudentModel;
                break;

            case "teacher":
                entityData = await db.query.teacher.findFirst({
                    where: eq(teacher.username, id),
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
        const model: EntityType = {
            ...createModel(entityData),
            stats: statsMap.get(id),
        };

        return { success: true, data: model };
    } catch (error) {
        console.error(`Error fetching ${entity}:`, error);
        return { success: false, error: `Failed to fetch ${entity}` };
    }
}
