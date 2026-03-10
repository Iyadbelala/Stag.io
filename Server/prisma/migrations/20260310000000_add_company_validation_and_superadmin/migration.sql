-- AlterEnum: add 'superadmin' to UserRole
ALTER TYPE "UserRole" ADD VALUE 'superadmin';

-- AlterEnum: add 'validated' to ApplicationStatus
ALTER TYPE "ApplicationStatus" ADD VALUE 'validated';

-- AlterTable: add company validation fields
ALTER TABLE "companies" ADD COLUMN "isValidated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "companies" ADD COLUMN "verificationDocumentUrl" TEXT;
