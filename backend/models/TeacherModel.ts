import type { TeacherType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type TeacherModel = AbstractModel<TeacherType> & {
    stats?: DataboardStats;
    popoverType?: "teacher_event_equipment";
};

export function createTeacherModel(teacherData: any): TeacherModel {
    const { school, commissions, lessons, equipments, ...pgTableSchema } = teacherData;

    const model: TeacherModel = {
        schema: pgTableSchema,
        relations: {
            school,
            commissions,
            lessons,
            equipments,
        },
        popoverType: "teacher_event_equipment",
    };

    if (process.env.JSONIFY === "true") {
        console.log("DEV:JSON: TeacherModel =", model);
    }

    return model;
}
