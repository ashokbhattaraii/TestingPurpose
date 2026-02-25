/*
  Warnings:

  - Added the required column `preferredLunchOption` to the `LunchAttendance` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LaunchType" AS ENUM ('VEG', 'NON_VEG');

-- AlterTable
ALTER TABLE "LunchAttendance" ADD COLUMN     "preferredLunchOption" "LaunchType" NOT NULL;
