"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import { getSchoolHeader } from "@/types/headers";
import { referral, school, type ReferralForm, type ReferralType } from "@/drizzle/schema";
import { createReferralModel, type ReferralModel } from "@/backend/models";
import { buildReferralStatsQuery, createStatsMap } from "@/getters/databoard-sql-stats";
import type { ApiActionResponseModel } from "@/types/actions";

const referralWithRelations = {
    school: true,
    studentPackages: true,
};

// GET REFERRALS WITH STATS
export async function getReferralsWithStats(): Promise<ApiActionResponseModel<ReferralModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();

        let schoolId: string | undefined;
        if (schoolHeader) {
            schoolId = schoolHeader.id;
        }

        // 1. Fetch referrals with relations
        let referralsResult;
        try {
            referralsResult = schoolId
                ? await db.query.referral.findMany({
                      where: eq(referral.schoolId, schoolId),
                      with: referralWithRelations,
                  })
                : await db.query.referral.findMany({
                      with: referralWithRelations,
                  });
        } catch (ormError) {
            console.error("ORM Error:", ormError);
            throw ormError;
        }

        // 2. Execute SQL stats
        let statsResult;
        try {
            statsResult = await db.execute(buildReferralStatsQuery(schoolId));
        } catch (sqlError) {
            console.error("SQL Error:", sqlError);
            throw sqlError;
        }

        // 3. Create stats map for quick lookup
        const statsRows = Array.isArray(statsResult) ? statsResult : (statsResult as any).rows || [];
        const statsMap = createStatsMap(statsRows);

        // 4. Merge stats into models
        const referrals: ReferralModel[] = referralsResult.map((referralData) => ({
            ...createReferralModel(referralData),
            stats: statsMap.get(referralData.id),
        }));

        console.log("getReferralsWithStats created referrals:", referrals);

        return { success: true, data: referrals };
    } catch (error) {
        console.error("Error fetching referrals with stats:", error);
        return { success: false, error: `Failed to fetch referrals: ${error instanceof Error ? error.message : String(error)}` };
    }
}

// CREATE
export async function createReferral(referralSchema: ReferralForm): Promise<ApiActionResponseModel<ReferralType>> {
    try {
        const result = await db.insert(referral).values(referralSchema).returning();
        revalidatePath("/referrals");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error creating referral:", error);
        return { success: false, error: "Failed to create referral" };
    }
}

// READ
export async function getReferrals(): Promise<ApiActionResponseModel<ReferralModel[]>> {
    try {
        const schoolHeader = await getSchoolHeader();

        let result;
        if (schoolHeader) {
            result = await db.query.referral.findMany({
                where: eq(referral.schoolId, schoolHeader.id),
                with: referralWithRelations,
            });
        } else {
            result = await db.query.referral.findMany({
                with: referralWithRelations,
            });
        }

        const referrals: ReferralModel[] = result.map((referralData) => createReferralModel(referralData));
        return { success: true, data: referrals };
    } catch (error) {
        console.error("Error fetching referrals:", error instanceof Error ? error.message : String(error));
        return { success: false, error: `Failed to fetch referrals: ${error instanceof Error ? error.message : String(error)}` };
    }
}

export async function getReferralById(id: string): Promise<ApiActionResponseModel<ReferralModel>> {
    try {
        const result = await db.query.referral.findFirst({
            where: eq(referral.id, id),
            with: referralWithRelations,
        });

        if (result) {
            return { success: true, data: createReferralModel(result) };
        }
        return { success: false, error: "Referral not found" };
    } catch (error) {
        console.error("Error fetching referral:", error);
        return { success: false, error: "Failed to fetch referral" };
    }
}

export async function getReferralsBySchoolId(schoolId: string): Promise<ApiActionResponseModel<ReferralModel[]>> {
    try {
        const result = await db.query.referral.findMany({
            where: eq(referral.schoolId, schoolId),
            with: referralWithRelations,
        });

        const referrals: ReferralModel[] = result.map((referralData) => createReferralModel(referralData));

        return { success: true, data: referrals };
    } catch (error) {
        console.error("Error fetching referrals by school ID:", error);
        return { success: false, error: "Failed to fetch referrals" };
    }
}

// UPDATE
export async function updateReferral(id: string, referralSchema: Partial<ReferralForm>): Promise<ApiActionResponseModel<ReferralType>> {
    try {
        const result = await db.update(referral).set(referralSchema).where(eq(referral.id, id)).returning();
        revalidatePath("/referrals");
        return { success: true, data: result[0] };
    } catch (error) {
        console.error("Error updating referral:", error);
        return { success: false, error: "Failed to update referral" };
    }
}

// DELETE
export async function deleteReferral(id: string): Promise<ApiActionResponseModel<null>> {
    try {
        await db.delete(referral).where(eq(referral.id, id));
        revalidatePath("/referrals");
        return { success: true, data: null };
    } catch (error) {
        console.error("Error deleting referral:", error);
        return { success: false, error: "Failed to delete referral" };
    }
}
