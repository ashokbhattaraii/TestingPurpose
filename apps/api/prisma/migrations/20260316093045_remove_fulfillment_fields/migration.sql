/*
  Warnings:

  - You are about to drop the column `fulfilledAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `fulfilledBy` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `isFulfilled` on the `Request` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "fulfilledAt",
DROP COLUMN "fulfilledBy",
DROP COLUMN "isFulfilled";
