/*
  Warnings:

  - The values [OFFICE_Supplies] on the enum `SuppliesCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `notes` on the `LunchAttendance` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SuppliesCategory_new" AS ENUM ('OFFICE_SUPPLIES', 'EQUIPMENT', 'STATIONERY', 'PANTRY', 'CLEANING', 'TECHNOLOGY', 'OTHER');
ALTER TABLE "RequestSuppliesDetails" ALTER COLUMN "category" TYPE "SuppliesCategory_new" USING ("category"::text::"SuppliesCategory_new");
ALTER TYPE "SuppliesCategory" RENAME TO "SuppliesCategory_old";
ALTER TYPE "SuppliesCategory_new" RENAME TO "SuppliesCategory";
DROP TYPE "public"."SuppliesCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "LunchAttendance" DROP COLUMN "notes";
