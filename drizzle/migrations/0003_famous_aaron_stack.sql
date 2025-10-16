CREATE TYPE "public"."equipment_category" AS ENUM('diving', 'snorkeling', 'surfing', 'kayaking', 'other');--> statement-breakpoint
CREATE TABLE "school_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration_minutes" integer NOT NULL,
	"description" text,
	"price_per_student" integer NOT NULL,
	"capacity_students" integer NOT NULL,
	"capacity_equipment" integer DEFAULT 1 NOT NULL,
	"category_equipment" "equipment_category" NOT NULL,
	"school_id" uuid,
	"is_public" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "school_package" ADD CONSTRAINT "school_package_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "school_package_school_id_idx" ON "school_package" USING btree ("school_id");