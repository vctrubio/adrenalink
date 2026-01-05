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
export { createBookings, linkStudentsToBookings } from "./booking";

// Lesson & Event seeding
export { createLessonsAndEvents, createTeacherEquipmentRelations } from "./lesson";

// Payment seeding
export { createTeacherLessonPayments, createStudentBookingPayments } from "./payment";

// Utilities
export { supabase } from "./client";
