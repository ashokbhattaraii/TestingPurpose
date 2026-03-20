/*
  Warnings:

  - The `preferredLunchOption` column on the `LunchAttendance` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[cuid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LunchType" AS ENUM ('VEG', 'NON_VEG');

-- AlterTable
ALTER TABLE "LunchAttendance" DROP COLUMN "preferredLunchOption",
ADD COLUMN     "preferredLunchOption" "LunchType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cuid" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone_home" TEXT,
ADD COLUMN     "phone_recovery" TEXT,
ADD COLUMN     "phone_work" TEXT;

-- DropEnum
DROP TYPE "LaunchType";

-- CreateIndex
CREATE UNIQUE INDEX "User_cuid_key" ON "User"("cuid");
