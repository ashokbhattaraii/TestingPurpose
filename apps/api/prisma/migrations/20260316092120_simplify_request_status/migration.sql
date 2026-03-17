/*
  Warnings:

  - The values [FULFILLED,CLOSED,CANCELLED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'REJECTED', 'RESOLVED', 'ON_HOLD');
ALTER TABLE "public"."Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "public"."RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "RequestIssueDetails" ADD COLUMN     "otherCategoryDetails" TEXT;

-- AlterTable
ALTER TABLE "RequestSuppliesDetails" ADD COLUMN     "otherCategoryDetails" TEXT;

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Settings";
