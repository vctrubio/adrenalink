import type { Metadata } from "next";
import { ReactNode } from "react";
import "../css/globals.css";
import Providers from "../providers/theme-provider";
import WalletProvider from "../providers/wallet-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
    title: "Adrenalink",
    description: "Connecting Students, Teachers and Admins",
    icons: {
        icon: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
            <body className="h-full bg-background text-foreground">
                <div className="min-h-screen bg-background">
                    <Providers>
                        <WalletProvider>{children}</WalletProvider>
                    </Providers>
                    <Analytics />
                </div>
            </body>
        </html>
    );
}
