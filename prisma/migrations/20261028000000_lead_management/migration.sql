-- Additive only. PREPARED FOR OWNER REVIEW; NOT APPLIED BY THE AGENT.
CREATE TYPE "LeadSource" AS ENUM ('POTENTIAL', 'SELF_FORM');
CREATE TYPE "LeadContactType" AS ENUM ('EMAIL', 'WHATSAPP', 'INSTAGRAM', 'WEBSITE', 'GOOGLE_MAPS', 'OTHER');
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'INTERESTED', 'CONVERTED', 'LOST');

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" VARCHAR(160) NOT NULL,
    "contactType" "LeadContactType" NOT NULL,
    "contactValue" VARCHAR(500) NOT NULL,
    "requirements" VARCHAR(2000),
    "internalNotes" VARCHAR(5000),
    "source" "LeadSource" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "submissionKey" VARCHAR(36),
    "submissionHash" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadSubmissionLimit" (
    "key" VARCHAR(64) NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadSubmissionLimit_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "Lead_submissionKey_key" ON "Lead"("submissionKey");
CREATE INDEX "Lead_source_createdAt_id_idx" ON "Lead"("source", "createdAt", "id");
CREATE INDEX "Lead_source_status_createdAt_id_idx" ON "Lead"("source", "status", "createdAt", "id");
CREATE INDEX "LeadSubmissionLimit_resetAt_idx" ON "LeadSubmissionLimit"("resetAt");
