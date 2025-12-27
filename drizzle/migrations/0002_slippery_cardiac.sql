ALTER TABLE "student" DROP CONSTRAINT "student_passport_unique";--> statement-breakpoint
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_passport_unique";--> statement-breakpoint
ALTER TABLE "school" ADD COLUMN "icon_url" varchar(500);--> statement-breakpoint
ALTER TABLE "school" ADD COLUMN "banner_url" varchar(500);