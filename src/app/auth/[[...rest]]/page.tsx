"use client";

import Link from "next/link";
import { SignIn, SignedIn, SignedOut, useClerk, useAuth } from "@clerk/nextjs";
import { ChangeTheWindFooter } from "@/src/components/ui/ChangeTheWindFooter";

function SignOutButton() {
    const { signOut } = useClerk();

    return (
        <button
            onClick={() => signOut()}
            className="w-full px-8 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
        >
            Sign Out
        </button>
    );
}

function UserInfo() {
    const { userId, isSignedIn } = useAuth();

    if (!isSignedIn || !userId) return null;

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold mb-2">Authenticated</p>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">
                User ID: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-xs">{userId}</code>
            </p>
            <p className="text-xs text-slate-700 dark:text-slate-300">
                You are signed in to Adrenalink. Select your school and role below to continue.
            </p>
        </div>
    );
}

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

                {/* Main Content */}
                <div className="space-y-12 mb-16">
                    {/* DRY Refactoring Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            DRY Refactoring Complete
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            {/* Centralized Utilities */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-start gap-3">
                                    <span className="text-blue-600 dark:text-blue-400 text-xl">01</span>
                                    Centralized Utilities
                                </h3>
                                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">→</span>
                                        <span>
                                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">logger.ts</code>
                                            - Structured logging
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">→</span>
                                        <span>
                                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">error-handlers.ts</code>
                                            - Safe error handling
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">→</span>
                                        <span>
                                            <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">school-context.ts</code>
                                            - Unified context
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Key Improvements */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-start gap-3">
                                    <span className="text-blue-600 dark:text-blue-400 text-xl">02</span>
                                    Key Improvements
                                </h3>
                                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>200+ console.log calls removed</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Magic error codes eliminated</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>40+ server action files updated</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">40+</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">Server Actions</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">3</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">Core Utilities</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">200+</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">Lines Cleaned</p>
                            </div>
                        </div>
                    </div>

                    {/* Providers Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            Providers Architecture
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-6">
                            The application uses a provider-based architecture to manage authentication, theme, and UI state across the app.
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Current Providers</h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <div>
                                            <p className="font-mono text-xs">ClerkProvider</p>
                                            <p className="text-xs">Enterprise authentication with multi-tenant support</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <div>
                                            <p className="font-mono text-xs">ThemeProvider</p>
                                            <p className="text-xs">Dark/light mode support via next-themes</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <div>
                                            <p className="font-mono text-xs">Toaster</p>
                                            <p className="text-xs">Toast notifications for user feedback</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* GlobalFlag Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            GlobalFlag: Classboard Live Sync
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-6">
                            The classboard page uses a centralized <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">GlobalFlag</code> instance to manage complex state for real-time event scheduling and teacher queue adjustments.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Live Sync Features</h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span><strong>Real-time Updates:</strong> Live event changes across all teachers</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span><strong>Cascade Locking:</strong> Sync time/location across all teachers</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span><strong>Optimistic Updates:</strong> Instant UI feedback with rollback</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">•</span>
                                        <span><strong>Conflict Detection:</strong> Auto-exit on server changes</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">State Management</h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span><strong>Event Mutations:</strong> Tracks creating/updating spinners</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span><strong>Adjustment Mode:</strong> Multi-teacher edit sessions</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span><strong>Single Source of Truth:</strong> All classboard state here</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span><strong>localStorage Persistence:</strong> Settings survive reload</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                <strong>Example:</strong> When a teacher adjusts event times, GlobalFlag instantly updates the UI, syncs to all teachers in cascade mode, and persists changes to the database with optimistic updates.
                            </p>
                        </div>
                    </div>

                    {/* User Roles Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            User Roles & Permissions
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-6">
                            Adrenalink supports three distinct user roles with different permissions and capabilities within each school.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Admin Role */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">A</span>
                                    Admin
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Full school management access</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Create/edit packages & bookings</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Manage teachers & students</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View all schedules & reports</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Configure school settings</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Teacher Role */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">T</span>
                                    Teacher
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View assigned bookings</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Manage own schedule & events</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Live classboard access</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Update event status</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View commission details</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Student Role */}
                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">S</span>
                                    Student
                                </h3>
                                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View own bookings</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>See assigned events</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View teacher information</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>Access class materials</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                                        <span>View payment history</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Clerk Integration Plan */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            TODO: Clerk User Mapping Implementation
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-6">
                            After successful Clerk authentication, complete these steps to map users to schools and assign roles.
                        </p>

                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
                                    Database Schema Updates
                                </h3>
                                <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-auto text-slate-900 dark:text-slate-100 font-mono">
{`-- Store Clerk user IDs
ALTER TABLE student ADD COLUMN clerk_id VARCHAR(255) UNIQUE;
ALTER TABLE teacher ADD COLUMN clerk_id VARCHAR(255) UNIQUE;

-- Track user-school-role relationships
CREATE TABLE school_users (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES school(id),
  user_type VARCHAR(50),
  clerk_id VARCHAR(255),
  entity_id UUID
);`}
                                </code>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
                                    Sync User on Sign-In
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Create server action: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">supabase/server/sync-clerk-user.ts</code></p>
                                <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-auto text-slate-900 dark:text-slate-100 font-mono">
{`export async function syncClerkUser(clerkId: string, email: string) {
  // 1. Check if clerk_id exists in student or teacher
  // 2. If not, create new record
  // 3. Link clerk_id to entity
  // 4. Return user profile
}`}
                                </code>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
                                    School Selection Flow
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    After sign-in, show user list of schools they belong to with role assignments. Redirect to appropriate dashboard.
                                </p>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Next Steps</h3>
                                <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside">
                                    <li>Run database migrations for clerk_id columns</li>
                                    <li>Create sync-clerk-user server action</li>
                                    <li>Create school selection page component</li>
                                    <li>Call sync action after successful Clerk sign-in</li>
                                    <li>Implement role-based redirects to dashboard</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Authentication Section */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            Authentication
                        </h2>

                        <p className="text-slate-700 dark:text-slate-300 mb-8">
                            Sign in with Clerk to access Adrenalink. After authentication, you'll be guided to select your school and role.
                        </p>

                        <div className="space-y-4">
                            {/* Signed Out State */}
                            <SignedOut>
                                <div className="flex flex-col gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                        <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold mb-2">Sign In Required</p>
                                        <p className="text-xs text-slate-700 dark:text-slate-300">
                                            Click the button below to sign in with Clerk. New users will be onboarded to select their school and role.
                                        </p>
                                    </div>
                                    <SignIn mode="modal" routing="hash" />
                                </div>
                            </SignedOut>

                            {/* Signed In State */}
                            <SignedIn>
                                <UserInfo />
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <p className="text-sm text-slate-900 dark:text-slate-100 font-semibold mb-2">Next Step</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 mb-4">
                                        Select your school and role to proceed to your dashboard.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/"
                                        className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                                    >
                                        Select School & Role
                                    </Link>
                                    <SignOutButton />
                                </div>
                            </SignedIn>
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                            <Link
                                href="/"
                                className="inline-flex px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <ChangeTheWindFooter
                showFooter={true}
                getStartedUrl="/auth"
                registerUrl="/auth"
                minimal={false}
            />
        </div>
    );
}
