import { getStudentPackageRequests } from "@/actions/student-package-action";
import { InvitationsController } from "./InvitationsController";

export default async function InvitationsPage() {
    const response = await getStudentPackageRequests();
    
    // In a real app, you might want to handle error states more gracefully or show empty state if null
    const invitations = response.success && response.data ? response.data : [];

    return (
        <div className="flex-1 h-full p-4 md:p-8 overflow-hidden flex flex-col bg-background">
            <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col min-h-0 overflow-y-auto pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Invitations</h1>
                    <p className="text-muted-foreground font-medium">Manage incoming package requests</p>
                </div>
                
                <InvitationsController invitations={invitations} />
            </div>
        </div>
    );
}