-- AlterEnum
ALTER TYPE "InquiryType" ADD VALUE 'DOCUMENT';

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN     "sourceSummary" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "QuoteRequestItem" ADD COLUMN     "backendItemNumber" TEXT NOT NULL DEFAULT '';
