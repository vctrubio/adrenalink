ALTER TABLE student_package RENAME COLUMN wallet_id TO requested_clerk_id;
ALTER TABLE student_package ALTER COLUMN requested_clerk_id TYPE VARCHAR(255);
