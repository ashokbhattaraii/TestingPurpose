/*
  Warnings:

  - The values [Supplies] on the enum `RequestType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `SuppliesCategory` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `issueCategory` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `issuePriority` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Request` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestType_new" AS ENUM ('ISSUE', 'SUPPLIES');
ALTER TABLE "Request" ALTER COLUMN "type" TYPE "RequestType_new" USING ("type"::text::"RequestType_new");
ALTER TYPE "RequestType" RENAME TO "RequestType_old";
ALTER TYPE "RequestType_new" RENAME TO "RequestType";
DROP TYPE "public"."RequestType_old";
COMMIT;

-- DropIndex
DROP INDEX "Request_SuppliesCategory_idx";

-- DropIndex
DROP INDEX "Request_issueCategory_idx";

-- DropIndex
DROP INDEX "Request_issuePriority_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "SuppliesCategory",
DROP COLUMN "issueCategory",
DROP COLUMN "issuePriority",
DROP COLUMN "itemName",
DROP COLUMN "location",
ALTER COLUMN "description" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RequestIssueDetails" (
    "requestId" TEXT NOT NULL,
    "priority" "IssuePriority" NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "location" TEXT,

    CONSTRAINT "RequestIssueDetails_pkey" PRIMARY KEY ("requestId")
);

-- CreateTable
CREATE TABLE "RequestSuppliesDetails" (
    "requestId" TEXT NOT NULL,
    "category" "SuppliesCategory" NOT NULL,
    "itemName" TEXT NOT NULL,

    CONSTRAINT "RequestSuppliesDetails_pkey" PRIMARY KEY ("requestId")
);

-- CreateIndex
CREATE INDEX "RequestIssueDetails_priority_idx" ON "RequestIssueDetails"("priority");

-- CreateIndex
CREATE INDEX "RequestIssueDetails_category_idx" ON "RequestIssueDetails"("category");

-- CreateIndex
CREATE INDEX "RequestSuppliesDetails_category_idx" ON "RequestSuppliesDetails"("category");

-- AddForeignKey
ALTER TABLE "RequestIssueDetails" ADD CONSTRAINT "RequestIssueDetails_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSuppliesDetails" ADD CONSTRAINT "RequestSuppliesDetails_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;
