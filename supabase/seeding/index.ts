/**
 * Seeding Index
 *
 * Central export of all seeding functions
 * Import from here to seed individual entities
 */

// School seeding
export { createSchool, type SchoolInput } from "./school";

// Student seeding
export { createStudents, createStudentsManual, associateStudentsWithSchool, type StudentInput } from "./student";

// Teacher seeding
export { createTeachers, createTeachersManual, type TeacherInput } from "./teacher";

// Commission seeding
export { createTeacherCommissions, createDefaultTeacherCommissions, type CommissionInput } from "./commission";

// Equipment seeding
export { createEquipment, createDefaultEquipment, type EquipmentInput } from "./equipment";

// Package seeding
export { createSchoolPackages, createDefaultSchoolPackages, createStudentPackages, type SchoolPackageInput } from "./package";

// Referral seeding
export { createReferrals, createDefaultReferrals, type ReferralInput } from "./referral";

// Booking seeding
export { createBookings, linkStudentsToBookings, updateStudentPackageStatus } from "./booking";

// Booking orchestrator (high-level utility)
export { orchestrateBookingFlow, type BookingFlowInput, type BookingFlowResult } from "./booking-orchestrator";

// Lesson & Event seeding
export { createLessonsAndEvents, addEquipmentToEvents, createStudentLessonFeedback } from "./lesson";

// Payment seeding
export { createTeacherLessonPayments, createStudentBookingPayments } from "./payment";

// Utilities
export { supabase } from "./client";
