-- Remove unique constraint on school.clerk_id to allow multiple schools with the same clerk_id
-- This enables multiple test schools to share the same test Clerk user ID
ALTER TABLE school DROP CONSTRAINT IF EXISTS school_clerk_id_key;
