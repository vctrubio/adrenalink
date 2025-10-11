import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Providers from "../providers/theme-provider";
import WalletProvider from "../providers/wallet-provider";
import Navbar from "../components/navbar";

export const metadata: Metadata = {
  title: "Adrenalink",
  description: "Connecting Students, Teachers and Admins",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
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
