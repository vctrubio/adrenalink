import type { Metadata } from "next";
import { ReactNode } from "react";
import "../css/globals.css";
import Providers from "../providers/theme-provider";
import WalletProvider from "../providers/wallet-provider";
import Navbar from "../components/navigations/navbar";

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
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-background text-foreground">
                <Providers>
                    <WalletProvider>
                        <Navbar />
                        {children}
                    </WalletProvider>
                </Providers>
            </body>
        </html>
    );
}
