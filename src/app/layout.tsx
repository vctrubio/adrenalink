import type { Metadata } from "next";
import { ReactNode } from "react";
import "../css/globals.css";
import Providers from "../providers/theme-provider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
    title: "Adrenalink",
    description: "Home of Adrenaline Activity",
    icons: {
        icon: "/ADR.webp",
        apple: "/ADR.webp",
        shortcut: "/ADR.webp",
    },
    manifest: "/manifest.json",
    openGraph: {
        title: "Adrenalink",
        description: "Home of Adrenaline Activity",
        siteName: "Adrenalink",
        images: ["/ADR.webp"],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Adrenalink",
        description: "Home of Adrenaline Activity",
        images: ["/ADR.webp"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning className="h-full">
            <head>
                <link rel="preload" as="image" href="/kritaps_ungurs_unplash/wave-wide.jpg" />
                <link rel="preload" as="image" href="/kritaps_ungurs_unplash/wave.jpg" />
            </head>
            <body className="h-full bg-background text-foreground">
                <div className="min-h-screen bg-background">
                    <Providers>{children}</Providers>
                    <Analytics />
                </div>
            </body>
        </html>
    );
}
