import { Plus, Bell } from "lucide-react";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import { WindToggle } from "@/src/components/themes/WindToggle"; // Import WindToggle

const ActionButton = ({ icon: Icon, children }: { icon?: React.ElementType, children?: React.ReactNode }) => (
    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent">
        {Icon && <Icon className="h-5 w-5" />}
        {children}
    </button>
);

export const NavRight = () => (
    <div className="flex items-center gap-2">
        <ActionButton icon={Plus} />
        <ActionButton icon={Bell} />
        <ActionButton>
            <WindToggle compact /> {/* Use WindToggle in compact mode */}
        </ActionButton>
        <ActionButton>
            <AdminIcon className="h-6 w-6" />
        </ActionButton>
    </div>
);
