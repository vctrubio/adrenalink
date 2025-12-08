import { type ReactNode } from "react";

type UsersLayoutProps = {
    children: ReactNode;
};

export default async function UsersLayout({ children }: UsersLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
    );
}
