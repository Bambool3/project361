/*
  Warnings:

  - Added the required column `periods_in_year` to the `frequencies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "frequencies" ADD COLUMN     "periods_in_year" INTEGER NOT NULL;
