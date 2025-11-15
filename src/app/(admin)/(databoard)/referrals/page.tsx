import { getReferrals } from "@/actions/referrals-action";
import { DataboardRowsSection } from "@/src/components/databoard/ClientDataHeader";
import { ReferralRow } from "@/src/components/databoard/rows/ReferralRow";

export default async function ReferralsPage() {
    const result = await getReferrals();

    if (!result.success) {
        return <div className="text-destructive">Error loading referrals: {result.error}</div>;
    }

    return (
        <div>
            <DataboardRowsSection entityId="referral" data={result.data} rowComponent={ReferralRow} />
        </div>
    );
}
