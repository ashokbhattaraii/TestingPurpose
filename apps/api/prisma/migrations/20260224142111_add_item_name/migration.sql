/*
  Warnings:

  - You are about to drop the `RequestIssueDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestSuppliesDetails` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `itemName` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RequestIssueDetails" DROP CONSTRAINT "RequestIssueDetails_requestId_fkey";

-- DropForeignKey
ALTER TABLE "RequestSuppliesDetails" DROP CONSTRAINT "RequestSuppliesDetails_requestId_fkey";

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "SuppliesCategory" "SuppliesCategory",
ADD COLUMN     "issueCategory" "IssueCategory",
ADD COLUMN     "issuePriority" "IssuePriority",
ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "location" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "RequestIssueDetails";

-- DropTable
DROP TABLE "RequestSuppliesDetails";

-- CreateIndex
CREATE INDEX "Request_issuePriority_idx" ON "Request"("issuePriority");

-- CreateIndex
CREATE INDEX "Request_issueCategory_idx" ON "Request"("issueCategory");

-- CreateIndex
CREATE INDEX "Request_SuppliesCategory_idx" ON "Request"("SuppliesCategory");
