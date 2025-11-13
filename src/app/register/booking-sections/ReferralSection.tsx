import { Section } from "./Section";
import { ENTITY_DATA } from "@/config/entities";
import { ReferralTable } from "@/src/components/tables/ReferralTable";

interface Referral {
    id: string;
    code: string;
    description: string | null;
    commissionType: string;
    commissionValue: string;
    active: boolean;
}

interface ReferralSectionProps {
    referrals: Referral[];
    selectedReferral: Referral | null;
    onSelect: (referral: Referral | null) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

export function ReferralSection({ 
    referrals, 
    selectedReferral, 
    onSelect, 
    isExpanded, 
    onToggle 
}: ReferralSectionProps) {
    const referralEntity = ENTITY_DATA.find(e => e.id === "referral");
    const title = selectedReferral 
        ? `${selectedReferral.code}` 
        : "Referral (Optional)";

    const safeReferrals = referrals || [];

    return (
        <Section
            id="referral-section"
            title={title}
            isExpanded={isExpanded}
            onToggle={onToggle}
            entityIcon={referralEntity?.icon}
            entityColor={referralEntity?.color}
        >
            <ReferralTable
                referrals={safeReferrals}
                selectedReferral={selectedReferral}
                onSelect={onSelect}
            />
        </Section>
    );
}
