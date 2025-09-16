/*
  Warnings:

  - Added the required column `name` to the `periods` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "periods" ADD COLUMN     "name" TEXT NOT NULL;
