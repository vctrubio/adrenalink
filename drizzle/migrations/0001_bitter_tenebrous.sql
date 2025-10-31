CREATE TYPE "public"."commission_type" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('rental', 'public', 'selling', 'sold', 'inrepair', 'rip');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('planned', 'tbc', 'completed', 'uncompleted');--> statement-breakpoint
CREATE TYPE "public"."languages" AS ENUM('Spanish', 'French', 'English', 'German', 'Italian');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('active', 'rest', 'completed', 'uncompleted');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('rental', 'lessons');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('planned', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" varchar(100) NOT NULL,
	"model" varchar(255) NOT NULL,
	"color" varchar(100),
	"size" integer,
	"status" "equipment_status",
	"school_id" uuid NOT NULL,
	"category" "equipment_category" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_equipment_event" UNIQUE("equipment_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "equipment_repair" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"check_in" date NOT NULL,
	"check_out" date,
	"price" integer NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"location" varchar(100),
	"status" "event_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"commission_id" uuid NOT NULL,
	"status" "lesson_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"school_id" uuid NOT NULL,
	"description" text,
	"commission_type" "commission_type" DEFAULT 'fixed' NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "rental" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"status" "rental_status" NOT NULL,
	"student_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_lesson_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_lesson_feedback" UNIQUE("student_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"passport" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"languages" text[] NOT NULL,
	"school_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teacher_passport_unique" UNIQUE("passport"),
	CONSTRAINT "unique_teacher_username_school" UNIQUE("school_id","username")
);
--> statement-breakpoint
CREATE TABLE "teacher_commission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"commission_type" "commission_type" NOT NULL,
	"description" text,
	"cph" numeric(10, 2) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_teacher_equipment" UNIQUE("teacher_id","equipment_id")
);
--> statement-breakpoint
ALTER TABLE "student" RENAME COLUMN "name" TO "first_name";--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "school_package" ALTER COLUMN "category_equipment" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."equipment_category";--> statement-breakpoint
CREATE TYPE "public"."equipment_category" AS ENUM('kite', 'wing', 'windsurf');--> statement-breakpoint
ALTER TABLE "equipment" ALTER COLUMN "category" SET DATA TYPE "public"."equipment_category" USING "category"::"public"."equipment_category";--> statement-breakpoint
ALTER TABLE "school_package" ALTER COLUMN "category_equipment" SET DATA TYPE "public"."equipment_category" USING "category_equipment"::"public"."equipment_category";--> statement-breakpoint
ALTER TABLE "school" ADD COLUMN "website_url" varchar(255);--> statement-breakpoint
ALTER TABLE "school" ADD COLUMN "instagram_url" varchar(255);--> statement-breakpoint
ALTER TABLE "school_package" ADD COLUMN "package_type" "package_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "school_students" ADD COLUMN "rental" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "last_name" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "languages" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "student_package" ADD COLUMN "referral_id" uuid;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_event" ADD CONSTRAINT "equipment_event_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_event" ADD CONSTRAINT "equipment_event_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_repair" ADD CONSTRAINT "equipment_repair_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_commission_id_teacher_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."teacher_commission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."teacher_commission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental" ADD CONSTRAINT "rental_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental" ADD CONSTRAINT "rental_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_feedback" ADD CONSTRAINT "student_lesson_feedback_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_feedback" ADD CONSTRAINT "student_lesson_feedback_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_commission" ADD CONSTRAINT "teacher_commission_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_equipment" ADD CONSTRAINT "teacher_equipment_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_equipment" ADD CONSTRAINT "teacher_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "equipment_school_id_idx" ON "equipment" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "equipment_category_idx" ON "equipment" USING btree ("category");--> statement-breakpoint
CREATE INDEX "equipment_event_equipment_id_idx" ON "equipment_event" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "equipment_event_event_id_idx" ON "equipment_event" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "equipment_repair_equipment_id_idx" ON "equipment_repair" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "event_lesson_id_idx" ON "event" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_teacher_booking_id_idx" ON "lesson" USING btree ("teacher_id","booking_id");--> statement-breakpoint
CREATE INDEX "rental_student_id_idx" ON "rental" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "rental_equipment_id_idx" ON "rental" USING btree ("equipment_id");--> statement-breakpoint
ALTER TABLE "school_package" ADD CONSTRAINT "school_package_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_referral_id_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "student_package_referral_id_idx" ON "student_package" USING btree ("referral_id");