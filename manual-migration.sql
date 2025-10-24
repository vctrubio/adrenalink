-- Manual migration for school table asset fields
-- Apply this directly in Supabase SQL editor

-- Create school_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'school_status') THEN
        CREATE TYPE "public"."school_status" AS ENUM('active', 'pending', 'closed');
    END IF;
END $$;

-- Add new columns to school table
ALTER TABLE "public"."school" 
ADD COLUMN IF NOT EXISTS "icon_url" varchar(500),
ADD COLUMN IF NOT EXISTS "banner_url" varchar(500),
ADD COLUMN IF NOT EXISTS "status" "school_status" DEFAULT 'pending' NOT NULL;