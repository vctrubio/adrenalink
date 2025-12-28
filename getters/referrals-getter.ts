import type { ReferralModel } from "@/backend/models";

export const ReferralStats = {
    getRevenue: (referral: ReferralModel): number => referral.stats?.money_in || 0,
    getExpenses: (referral: ReferralModel): number => referral.stats?.money_out || 0,
    getProfit: (referral: ReferralModel): number => ReferralStats.getRevenue(referral) - ReferralStats.getExpenses(referral),
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
