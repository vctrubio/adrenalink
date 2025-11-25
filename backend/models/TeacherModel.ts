import type { TeacherType } from "@/drizzle/schema";
import type { AbstractModel } from "./AbstractModel";
import type { DataboardStats } from "@/getters/databoard-sql-stats";

export type TeacherUpdateForm = TeacherType & {
    active?: boolean;
};

export type TeacherModel = AbstractModel<TeacherUpdateForm> & {
    schema: TeacherType;
    stats?: DataboardStats;
    popoverType?: "teacher_event_equipment";
};

export function createTeacherModel(teacherData: any): TeacherModel {
    const { school, commissions, lessons, equipments, ...pgTableSchema } = teacherData;

    const model: TeacherModel = {
        schema: pgTableSchema,
        updateForm: pgTableSchema,
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
