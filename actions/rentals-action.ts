"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getHeaderUsername } from "@/types/headers";
import { rental, school, type RentalForm, type RentalType } from "@/drizzle/schema";
import { createRentalModel, type RentalModel } from "@/backend/models";
import type { ApiActionResponseModel } from "@/types/actions";

const rentalWithRelations = {
    student: true,
    equipment: true,
};

// CREATE
export async function createRental(rentalSchema: RentalForm): Promise<ApiActionResponseModel<RentalType>> {
    try {
        const result = await db.insert(rental).values(rentalSchema).returning();
        revalidatePath("/rentals");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating rental:", error);
        return { success: false, error: "Failed to create rental" };
    }
}

// READ
export async function getRentals(): Promise<ApiActionResponseModel<RentalModel[]>> {
    try {
        const header = await getHeaderUsername();

        let result;
        if (header) {
            const schoolWithUsername = await db.query.school.findFirst({
                where: eq(school.username, header),
                columns: { id: true },
            });

            if (schoolWithUsername) {
                // Get rentals for students in this school
                result = await db.query.rental.findMany({
                    with: rentalWithRelations,
                });
                // Filter by school through student's schoolStudents relation
                // This is a simplified approach - rentals don't have direct schoolId
                // For now, return all rentals and filter by student's school in the query if needed
            } else {
                result = [];
            }
        } else {
            result = await db.query.rental.findMany({
                with: rentalWithRelations,
            });
        }

        const rentals: RentalModel[] = result.map((rentalData) => createRentalModel(rentalData));
        return { success: true, data: rentals };
    } catch (error) {
        console.error("Error fetching rentals:", error instanceof Error ? error.message : String(error));
        return { success: false, error: `Failed to fetch rentals: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function getRentalById(id: string): Promise<ApiActionResponseModel<RentalModel>> {
    try {
        const result = await db.query.rental.findFirst({
            where: eq(rental.id, id),
            with: rentalWithRelations,
        });

        if (result) {
            return { success: true, data: createRentalModel(result) };
        }
        return { success: false, error: "Rental not found" };
    } catch (error) {
        console.error("Error fetching rental:", error);
        return { success: false, error: "Failed to fetch rental" };
    }
}

// UPDATE
export async function updateRental(id: string, rentalSchema: Partial<RentalForm>): Promise<ApiActionResponseModel<RentalType>> {
    try {
        const result = await db.update(rental).set(rentalSchema).where(eq(rental.id, id)).returning();
        revalidatePath("/rentals");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating rental:", error);
        return { success: false, error: "Failed to update rental" };
    }
}

// DELETE
export async function deleteRental(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(rental).where(eq(rental.id, id));
        revalidatePath("/rentals");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting rental:", error);
        return { success: false, error: "Failed to delete rental" };
    }
}
