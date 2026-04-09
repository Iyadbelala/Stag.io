CREATE TYPE "public"."ApplicationStatus" AS ENUM('pending', 'accepted', 'rejected', 'withdrawn', 'validated');--> statement-breakpoint
CREATE TYPE "public"."NotificationType" AS ENUM('application_status_changed', 'new_application', 'agreement_needs_validation', 'company_pending_approval', 'university_pending_approval', 'new_review');--> statement-breakpoint
CREATE TYPE "public"."OfferStatus" AS ENUM('draft', 'active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."OfferType" AS ENUM('remote', 'onsite', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."ReviewerRole" AS ENUM('student', 'company');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('student', 'company', 'admin', 'superadmin', 'university');--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"offerId" text NOT NULL,
	"coverLetter" text,
	"cvUrl" text,
	"status" "ApplicationStatus" DEFAULT 'pending' NOT NULL,
	"appliedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actorId" text NOT NULL,
	"actorRole" text NOT NULL,
	"action" text NOT NULL,
	"targetId" text,
	"metadata" jsonb,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"companyName" text NOT NULL,
	"industry" text,
	"website" text,
	"logoUrl" text,
	"description" text,
	"location" text,
	"contactPerson" text,
	"isValidated" boolean DEFAULT false NOT NULL,
	"verificationDocumentUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "internship_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"companyId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"requirements" text NOT NULL,
	"duration" text NOT NULL,
	"location" text NOT NULL,
	"type" "OfferType" DEFAULT 'onsite' NOT NULL,
	"status" "OfferStatus" DEFAULT 'active' NOT NULL,
	"bannerUrl" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" "NotificationType" NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"relatedId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"applicationId" text NOT NULL,
	"reviewerUserId" text NOT NULL,
	"revieweeUserId" text NOT NULL,
	"reviewerRole" "ReviewerRole" NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"studentId" text NOT NULL,
	"offerId" text NOT NULL,
	"savedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"department" text,
	"cvUrl" text,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"bio" text,
	"profilePhotoUrl" text,
	"portfolioPhotos" text[] DEFAULT '{}' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "students_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"universityName" text NOT NULL,
	"domain" text NOT NULL,
	"website" text,
	"logoUrl" text,
	"description" text,
	"location" text,
	"isValidated" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "universities_userId_unique" UNIQUE("userId"),
	CONSTRAINT "universities_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"passwordHash" text NOT NULL,
	"role" "UserRole" DEFAULT 'student' NOT NULL,
	"firstName" text,
	"lastName" text,
	"university" text,
	"isEmailVerified" boolean DEFAULT false NOT NULL,
	"emailVerificationCode" text,
	"emailVerificationExpiry" timestamp with time zone,
	"passwordResetToken" text,
	"passwordResetExpiry" timestamp with time zone,
	"deactivatedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_offerId_internship_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."internship_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "internship_offers" ADD CONSTRAINT "internship_offers_companyId_companies_id_fk" FOREIGN KEY ("companyId") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_applicationId_applications_id_fk" FOREIGN KEY ("applicationId") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerUserId_users_id_fk" FOREIGN KEY ("reviewerUserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeUserId_users_id_fk" FOREIGN KEY ("revieweeUserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_offers" ADD CONSTRAINT "saved_offers_studentId_students_id_fk" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_offers" ADD CONSTRAINT "saved_offers_offerId_internship_offers_id_fk" FOREIGN KEY ("offerId") REFERENCES "public"."internship_offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universities" ADD CONSTRAINT "universities_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;