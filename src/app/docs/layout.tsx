"use client";
import { ReactNode } from "react";
import HeaderNav from "./HeaderNav";

export default function DocsLayout({ children }: { children: ReactNode }) {
	return (
		<div>
			<HeaderNav />
			<main>{children}</main>
		</div>
	);
}
