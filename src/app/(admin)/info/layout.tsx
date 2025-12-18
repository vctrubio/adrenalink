import { ReactNode } from "react";

export default function InfoLayout({ children }: { children: ReactNode }) {
    return <div className="p-8">{children}</div>;
}
