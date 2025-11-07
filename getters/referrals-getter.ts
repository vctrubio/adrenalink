import type { ReferralModel } from "@/backend/models";

export const ReferralStats = {
    getStudentCount: (referral: ReferralModel): number => referral.stats?.student_count || 0,
    getEventsCount: (referral: ReferralModel): number => referral.stats?.events_count || 0,
    getTotalHours: (referral: ReferralModel): number => (referral.stats?.total_duration_minutes || 0) / 60,
    getMoneyIn: (referral: ReferralModel): number => referral.stats?.money_in || 0,
    getMoneyOut: (referral: ReferralModel): number => referral.stats?.money_out || 0,
    getRevenue: (referral: ReferralModel): number => ReferralStats.getMoneyIn(referral) - ReferralStats.getMoneyOut(referral),
};

export const getReferralDescription = (referral: ReferralModel): string => {
    return referral.schema.description || "-";
};

export const getReferralCode = (referral: ReferralModel): string => {
    return referral.schema.code;
};

export const isReferralActive = (referral: ReferralModel): boolean => {
    return referral.schema.active;
};

export const getReferralCommissionType = (referral: ReferralModel): string => {
    return referral.schema.commissionType;
};

export const getReferralCommissionValue = (referral: ReferralModel): string => {
    const value = referral.schema.commissionValue;
    const type = referral.schema.commissionType;
    return type === "percentage" ? `${value}%` : value.toString();
};
