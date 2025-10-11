"use client";

import { useEffect, ReactNode } from "react";

export default function WalletProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("who im i on log:", "unamed");
  }, []);

  return <>{children}</>;
}
