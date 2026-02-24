/*
  Warnings:

  - You are about to drop the column `SuppliesCategory` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedCost` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `issueCategory` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `issuePriority` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `itemName` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `urgencyDate` on the `Request` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Request_SuppliesCategory_idx";

-- DropIndex
DROP INDEX "Request_issueCategory_idx";

-- DropIndex
DROP INDEX "Request_issuePriority_idx";

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "SuppliesCategory",
DROP COLUMN "estimatedCost",
DROP COLUMN "issueCategory",
DROP COLUMN "issuePriority",
DROP COLUMN "itemName",
DROP COLUMN "location",
DROP COLUMN "quantity",
DROP COLUMN "urgencyDate";

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
