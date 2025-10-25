"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Wifi, WifiOff } from "lucide-react";

interface ConnectivityCheckProps {
    onConnectivityChange?: (isConnected: boolean) => void;
}

export function R2ConnectivityCheck({ onConnectivityChange }: ConnectivityCheckProps) {
    const [isChecking, setIsChecking] = useState(true);
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkR2Connectivity();
    }, []);

    const checkR2Connectivity = async () => {
        setIsChecking(true);
        setError(null);
        
        try {
            console.log("🔍 Checking R2 connectivity via upload endpoint...");
            
            // Test connectivity by making a simple HEAD request to the upload endpoint
            const response = await fetch("/api/cloudflare/upload", {
                method: "HEAD",
                signal: AbortSignal.timeout(8000), // 8 second timeout
            });

            if (response.ok || response.status === 405) { // 405 Method Not Allowed is expected for HEAD
                console.log("✅ R2 connectivity check passed");
                setIsConnected(true);
                onConnectivityChange?.(true);
            } else {
                console.log("❌ R2 connectivity check failed with status:", response.status);
                setIsConnected(false);
                setError(`Upload endpoint returned status ${response.status}`);
                onConnectivityChange?.(false);
            }
        } catch (error) {
            console.error("❌ R2 connectivity check error:", error);
            setIsConnected(false);
            
            if (error instanceof Error) {
                if (error.name === "TimeoutError") {
                    setError("R2 connection timeout - network may be blocking Cloudflare R2 access");
                } else {
                    setError(`R2 connectivity error: ${error.message}`);
                }
            } else {
                setError("Unknown R2 connectivity error");
            }
            onConnectivityChange?.(false);
        } finally {
            setIsChecking(false);
        }
    };

    if (isChecking) {
        return (
            <div className="w-full bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                    <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-100">
                            Checking Network Connectivity
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Verifying connection to file upload service...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (isConnected === false) {
        return (
            <div className="w-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                            Network Connectivity Issue Detected
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                            Your network cannot reach our file upload service (Cloudflare R2). This may be due to:
                        </p>
                        <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-3 list-disc list-inside">
                            <li>Corporate firewall blocking external file services</li>
                            <li>Network restrictions on Cloudflare endpoints</li>
                            <li>ISP filtering or connectivity issues</li>
                        </ul>
                        <div className="bg-red-100 dark:bg-red-900/30 rounded p-3">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                                What happens if you continue:
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                When you submit the form, file uploads will fail and you&apos;ll be given an email fallback option to manually process your registration.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <button
                                onClick={checkR2Connectivity}
                                className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
                            >
                                Retry Check
                            </button>
                            <p className="text-xs text-red-600 dark:text-red-400">
                                Try switching networks or disabling VPN if available
                            </p>
                        </div>
                        {error && (
                            <details className="mt-3">
                                <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                                    Technical Details
                                </summary>
                                <pre className="text-xs text-red-600 dark:text-red-400 mt-1 font-mono bg-red-100 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                                    {error}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isConnected === true) {
        return (
            <div className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-3">
                    <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Network connectivity verified - file uploads should work normally
                    </p>
                </div>
            </div>
        );
    }

    return null;
}