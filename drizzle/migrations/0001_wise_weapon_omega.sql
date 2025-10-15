ALTER TABLE "school" ADD COLUMN "username" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "school" ADD CONSTRAINT "school_username_unique" UNIQUE("username");