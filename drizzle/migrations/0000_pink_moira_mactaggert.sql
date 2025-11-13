CREATE TYPE "public"."booking_status" AS ENUM('active', 'completed', 'uncompleted');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."equipment_category" AS ENUM('kite', 'wing', 'windsurf');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('rental', 'public', 'selling', 'sold', 'inrepair', 'rip');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('planned', 'tbc', 'completed', 'uncompleted');--> statement-breakpoint
CREATE TYPE "public"."languages" AS ENUM('Spanish', 'French', 'English', 'German', 'Italian');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('active', 'rest', 'completed', 'uncompleted');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('rental', 'lessons');--> statement-breakpoint
CREATE TYPE "public"."rental_status" AS ENUM('planned', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."school_status" AS ENUM('active', 'pending', 'closed');--> statement-breakpoint
CREATE TYPE "public"."student_package_status" AS ENUM('requested', 'accepted', 'rejected');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date_start" date NOT NULL,
	"date_end" date NOT NULL,
	"school_id" uuid NOT NULL,
	"student_package_id" uuid NOT NULL,
	"status" "booking_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "booking_student_unique" UNIQUE("booking_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sku" varchar(100) NOT NULL,
	"model" varchar(255) NOT NULL,
	"color" varchar(100),
	"size" integer,
	"status" "equipment_status",
	"school_id" uuid NOT NULL,
	"category" "equipment_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid,
	"lesson_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"location" varchar(100),
	"status" "event_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid,
	"teacher_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"commission_id" uuid NOT NULL,
	"status" "lesson_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "rental" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"duration" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"status" "rental_status" NOT NULL,
	"student_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"status" "school_status" DEFAULT 'pending' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(10, 8),
	"timezone" varchar(50),
	"google_place_id" varchar(255),
	"equipment_categories" text,
	"website_url" varchar(255),
	"instagram_url" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "school_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "school_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"duration_minutes" integer NOT NULL,
	"description" text NOT NULL,
	"price_per_student" integer NOT NULL,
	"capacity_students" integer NOT NULL,
	"capacity_equipment" integer DEFAULT 1 NOT NULL,
	"category_equipment" "equipment_category" NOT NULL,
	"package_type" "package_type" NOT NULL,
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
	"rental" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_school" UNIQUE("student_id","school_id")
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"passport" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"languages" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_passport_unique" UNIQUE("passport")
);
--> statement-breakpoint
CREATE TABLE "student_booking_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"booking_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_lesson_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_lesson_feedback" UNIQUE("student_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "student_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_package_id" uuid NOT NULL,
	"referral_id" uuid,
	"wallet_id" uuid NOT NULL,
	"requested_date_start" date NOT NULL,
	"requested_date_end" date NOT NULL,
	"status" "student_package_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_package_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_package_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_student_package_student" UNIQUE("student_package_id","student_id")
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_teacher_equipment" UNIQUE("teacher_id","equipment_id")
);
--> statement-breakpoint
CREATE TABLE "teacher_lesson_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" integer NOT NULL,
	"lesson_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_student_package_id_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_event" ADD CONSTRAINT "equipment_event_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_event" ADD CONSTRAINT "equipment_event_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_repair" ADD CONSTRAINT "equipment_repair_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_commission_id_teacher_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."teacher_commission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_commission_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."teacher_commission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral" ADD CONSTRAINT "referral_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental" ADD CONSTRAINT "rental_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rental" ADD CONSTRAINT "rental_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_package" ADD CONSTRAINT "school_package_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_package" ADD CONSTRAINT "school_package_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_students" ADD CONSTRAINT "school_students_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_students" ADD CONSTRAINT "school_students_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_booking_payment" ADD CONSTRAINT "student_booking_payment_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_booking_payment" ADD CONSTRAINT "student_booking_payment_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_feedback" ADD CONSTRAINT "student_lesson_feedback_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_lesson_feedback" ADD CONSTRAINT "student_lesson_feedback_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_school_package_id_school_package_id_fk" FOREIGN KEY ("school_package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_referral_id_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_school_package_id_fk" FOREIGN KEY ("school_package_id") REFERENCES "public"."school_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package" ADD CONSTRAINT "student_package_referral_id_fk" FOREIGN KEY ("referral_id") REFERENCES "public"."referral"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package_student" ADD CONSTRAINT "student_package_student_student_package_id_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package_student" ADD CONSTRAINT "student_package_student_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package_student" ADD CONSTRAINT "student_package_student_package_id_fk" FOREIGN KEY ("student_package_id") REFERENCES "public"."student_package"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_package_student" ADD CONSTRAINT "student_package_student_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_school_id_school_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_commission" ADD CONSTRAINT "teacher_commission_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_equipment" ADD CONSTRAINT "teacher_equipment_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_equipment" ADD CONSTRAINT "teacher_equipment_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teacher_lesson_payment" ADD CONSTRAINT "teacher_lesson_payment_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_school_id_idx" ON "booking" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "booking_student_package_id_idx" ON "booking" USING btree ("student_package_id");--> statement-breakpoint
CREATE INDEX "booking_student_booking_id_idx" ON "booking_student" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_student_student_id_idx" ON "booking_student" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "equipment_school_id_idx" ON "equipment" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "equipment_category_idx" ON "equipment" USING btree ("category");--> statement-breakpoint
CREATE INDEX "equipment_event_equipment_id_idx" ON "equipment_event" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "equipment_event_event_id_idx" ON "equipment_event" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "equipment_repair_equipment_id_idx" ON "equipment_repair" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "event_school_id_idx" ON "event" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "event_lesson_id_idx" ON "event" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lesson_school_id_idx" ON "lesson" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "lesson_teacher_booking_id_idx" ON "lesson" USING btree ("teacher_id","booking_id");--> statement-breakpoint
CREATE INDEX "rental_student_id_idx" ON "rental" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "rental_equipment_id_idx" ON "rental" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "school_package_school_id_idx" ON "school_package" USING btree ("school_id");--> statement-breakpoint
CREATE INDEX "student_payment_booking_id_idx" ON "student_booking_payment" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "student_payment_student_id_idx" ON "student_booking_payment" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_package_school_package_id_idx" ON "student_package" USING btree ("school_package_id");--> statement-breakpoint
CREATE INDEX "student_package_referral_id_idx" ON "student_package" USING btree ("referral_id");--> statement-breakpoint
CREATE INDEX "student_package_wallet_id_idx" ON "student_package" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "student_package_student_package_id_idx" ON "student_package_student" USING btree ("student_package_id");--> statement-breakpoint
CREATE INDEX "student_package_student_student_id_idx" ON "student_package_student" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "payment_lesson_id_idx" ON "teacher_lesson_payment" USING btree ("lesson_id");