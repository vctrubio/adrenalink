-- ============================================================================
-- Enable Realtime for student_package table
-- ============================================================================
-- This allows real-time subscriptions to detect INSERT, UPDATE, DELETE events
-- on the student_package table for the invitations/reservations page

ALTER PUBLICATION supabase_realtime ADD TABLE student_package;
