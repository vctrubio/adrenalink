"use client";

import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
            <div className="w-full max-w-2xl mx-auto text-center space-y-8">
                {/* 404 Header */}
                <div className="space-y-4">
                    <h1 className="text-9xl md:text-10xl font-bold text-slate-900 dark:text-slate-100">
                        404
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100">
                        Page Not Found
                    </h2>
                    <p className="text-xl text-slate-700 dark:text-slate-300">
                        The page you&apos;re looking for doesn&apos;t exist, but don&apos;t worry—let&apos;s get you back on track.
                    </p>
                </div>

                {/* Info Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono mb-2">
                        Route: Not Found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                        This page is rendered by <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">src/app/not-found.tsx</code>
                    </p>
                </div>

                {/* Suggestions */}
                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Where to go:</h3>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex gap-2">
                            <span className="text-blue-600 dark:text-blue-400">→</span>
                            <span><Link href="/" className="hover:underline text-blue-600 dark:text-blue-400">Home</Link> - Back to the main landing page</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600 dark:text-blue-400">→</span>
                            <span><Link href="/discover" className="hover:underline text-blue-600 dark:text-blue-400">Discover</Link> - Browse available schools</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-blue-600 dark:text-blue-400">→</span>
                            <span><Link href="/auth" className="hover:underline text-blue-600 dark:text-blue-400">Sign In</Link> - Access your account</span>
                        </li>
                    </ul>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/discover"
                        className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors text-center"
                    >
                        Browse Schools
                    </Link>
                </div>
            </div>
        </div>
    );
}
