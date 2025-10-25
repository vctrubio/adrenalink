CREATE TYPE "public"."equipment_category" AS ENUM('kite', 'wing', 'windsurf', 'surf', 'snowboard');--> statement-breakpoint
CREATE TYPE "public"."school_status" AS ENUM('active', 'pending', 'closed');--> statement-breakpoint
CREATE TYPE "public"."student_package_status" AS ENUM('requested', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"date_start" date NOT NULL,
	"date_end" date NOT NULL,
	"school_id" uuid,
	"student_package_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "booking_student_unique" UNIQUE("booking_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "school" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"icon_url" varchar(500),
	"banner_url" varchar(500),
	"status" "school_status" DEFAULT 'pending' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(10, 8),
	"google_place_id" varchar(255),
	"equipment_categories" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_username_unique" UNIQUE("username")
);
--> statement-breakpoint
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
CREATE TABLE "school_students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_school" UNIQUE("student_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"passport" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_passport_unique" UNIQUE("passport")
);
--> statement-breakpoint
CREATE TABLE "student_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"requested_date_start" date NOT NULL,
	"requested_date_end" date NOT NULL,
	"status" "student_package_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_package_id_school_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_student_package_id_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_package" ADD CONSTRAINT "school_package_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_students" ADD CONSTRAINT "school_students_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_students" ADD CONSTRAINT "school_students_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_package_id_school_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_school_id_idx" ON "booking" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "booking_package_id_idx" ON "booking" USING btree ("package_id");--> statement-breakpoint
CREATE INDEX "booking_student_package_id_idx" ON "booking" USING btree ("student_package_id");--> statement-breakpoint
CREATE INDEX "booking_student_booking_id_idx" ON "booking_student" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_student_student_id_idx" ON "booking_student" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "school_package_school_id_idx" ON "school_package" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "student_package_student_id_idx" ON "student_package" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_package_package_id_idx" ON "student_package" USING btree ("package_id");