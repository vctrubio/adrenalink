import type { Metadata } from "next";
import { ReactNode } from "react";
import "../css/globals.css";
import Providers from "../providers/theme-provider";
import WalletProvider from "../providers/wallet-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
    title: "Adrenalink",
    description: "Home of Adrenaline Activity",
    icons: {
        icon: [
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon-32x32.png",
    },
    manifest: "/manifest.json",
    openGraph: {
        title: "Adrenalink",
        description: "Home of Adrenaline Activity",
        siteName: "Adrenalink",
        images: ["/icon/og.svg"],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Adrenalink",
        description: "Home of Adrenaline Activity",
        images: ["/icon/og.svg"],
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
