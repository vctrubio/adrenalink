import type { SchoolPackageType } from "@/drizzle/schema";
import { AbstractModel } from "./AbstractModel";

export class SchoolPackageModel extends AbstractModel<SchoolPackageType> {
    lambda?: {
        durationHours?: number;
        revenue?: number;
        studentPricePerHour?: number;
        revenuePerHour?: number;
    };

    constructor(schema: SchoolPackageType) {
        super("school_package", schema);
        
        // Calculate lambda values
        this.lambda = {
            durationHours: this.getDurationHours(),
            revenue: this.getRevenue(),
            studentPricePerHour: this.getStudentPricePerHour(),
            revenuePerHour: this.getRevenuePerHour(),
        };
    }

    private getDurationHours(): number {
        return this.schema.durationMinutes / 60;
    }

    private getRevenue(): number {
        return this.schema.pricePerStudent * this.schema.capacityStudents;
    }

    private getStudentPricePerHour(): number {
        const hours = this.getDurationHours();
        return hours > 0 ? this.schema.pricePerStudent / hours : 0;
    }

    private getRevenuePerHour(): number {
        const hours = this.getDurationHours();
        return hours > 0 ? this.getRevenue() / hours : 0;
    }
}
