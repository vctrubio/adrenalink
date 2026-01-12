-- Set REPLICA IDENTITY FULL for event table so DELETE events include all columns (like lesson_id)
ALTER TABLE "event" REPLICA IDENTITY FULL;
