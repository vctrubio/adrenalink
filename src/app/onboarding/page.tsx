import { Onboarding } from "@/src/components/onboarding";
import { SchoolTeachersProvider } from "@/src/providers/school-teachers-provider";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <SchoolTeachersProvider>
      <Onboarding />
    </SchoolTeachersProvider>
  );
}
