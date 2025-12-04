import { type ReactNode } from "react";
import UserNavBar from "@/src/components/navigations/UserNavBar";

type UsersLayoutProps = {
	children: ReactNode;
};

export default async function UsersLayout({ children }: UsersLayoutProps) {
	return (
		<div className="flex flex-col min-h-screen bg-background">
			<UserNavBar />
			<main className="flex-1 overflow-y-auto p-6">{children}</main>
		</div>
	);
}
