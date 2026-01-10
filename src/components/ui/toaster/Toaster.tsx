"use client";

import { Toaster as ToasterFromLib } from "react-hot-toast";

export function Toaster() {
    return (
        <ToasterFromLib
            position="top-center"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
                duration: 4000,
                style: {
                    background: "#fff",
                    color: "#000",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                },
                success: {
                    style: {
                        background: "#fff",
                        color: "#000",
                    },
                },
                error: {
                    style: {
                        background: "#fff",
                        color: "#000",
                    },
                },
            }}
        />
    );
}
