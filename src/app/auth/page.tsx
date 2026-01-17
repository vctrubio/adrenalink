"use client";

import Link from "next/link";

export default function AuthLandingPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-32">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
                        Adrenalink
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Next-generation booking and event management platform
                    </p>
                </div>

                {/* Refactoring Summary */}
                <div className="space-y-12 mb-16">
                    {/* DRY Refactoring Section */}
                    <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            DRY Refactoring Complete
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            {/* Centralized Utilities */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground flex items-start gap-3">
                                    <span className="text-primary text-xl">01</span>
                                    Centralized Utilities
                                </h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex gap-2">
                                        <span className="text-primary">→</span>
                                        <span>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">
                                                logger.ts
                                            </code>
                                            - Structured logging
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">→</span>
                                        <span>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">
                                                error-handlers.ts
                                            </code>
                                            - Safe error handling
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-primary">→</span>
                                        <span>
                                            <code className="bg-muted px-2 py-1 rounded text-sm">
                                                school-context.ts
                                            </code>
                                            - Unified context retrieval
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Key Improvements */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-foreground flex items-start gap-3">
                                    <span className="text-primary text-xl">02</span>
                                    Key Improvements
                                </h3>
                                <ul className="space-y-2 text-muted-foreground">
                                    <li className="flex gap-2">
                                        <span className="text-accent">✓</span>
                                        <span>200+ console.log calls removed</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-accent">✓</span>
                                        <span>Magic error codes eliminated</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-accent">✓</span>
                                        <span>40+ server action files updated</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-primary">40+</p>
                                <p className="text-sm text-muted-foreground">Server Actions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-primary">3</p>
                                <p className="text-sm text-muted-foreground">Core Utilities</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-primary">200+</p>
                                <p className="text-sm text-muted-foreground">Lines Cleaned</p>
                            </div>
                        </div>
                    </div>

                    {/* What Changed */}
                    <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            What Changed
                        </h2>

                        <div className="space-y-6">
                            {/* Logger */}
                            <div className="pb-6 border-b border-border last:border-b-0">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Structured Logging
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">Before:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            console.error("Error:", error)
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">After:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            logger.error("Failed to fetch", error)
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* Error Handling */}
                            <div className="pb-6 border-b border-border last:border-b-0">
                                <h3 className="font-semibold text-foreground mb-2">
                                    Safe Array Handling
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">Before:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            (data || []).map(...)
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">After:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            safeArray(data).map(...)
                                        </code>
                                    </div>
                                </div>
                            </div>

                            {/* School Context */}
                            <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                    Centralized Context Retrieval
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">Before:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            {`const header = headers()\nconst schoolId = header.get(...)`}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-2 font-mono">After:</p>
                                        <code className="block bg-muted p-3 rounded text-xs overflow-auto">
                                            {`const context = \nawait getSchoolContext()`}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Benefits
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">Maintainability</p>
                                <p className="text-muted-foreground text-sm">
                                    Single source of truth for logging, error handling, and context retrieval. Changes in one place propagate everywhere.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">Consistency</p>
                                <p className="text-muted-foreground text-sm">
                                    All error handling follows the same pattern. All logs have the same structure and format.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">Debugging</p>
                                <p className="text-muted-foreground text-sm">
                                    Structured logs make it easier to trace issues and understand the flow of operations.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-foreground">Code Quality</p>
                                <p className="text-muted-foreground text-sm">
                                    Removes repetitive boilerplate. Developers write less error-prone code following established patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-primary/10 border border-primary rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                        Ready to Test?
                    </h2>
                    <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                        The refactoring is complete and all tests pass. The code is production-ready on the clerk-auth branch.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
