/*
  Warnings:

  - Added the required column `notification_date` to the `periods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "periods" ADD COLUMN     "notification_date" TIMESTAMP(3) NOT NULL;
