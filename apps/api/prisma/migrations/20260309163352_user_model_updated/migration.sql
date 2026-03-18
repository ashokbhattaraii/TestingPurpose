/*
  Warnings:

  - You are about to drop the column `attachments` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "attachments";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "employment_type" TEXT,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "org_unit" TEXT;
