/*
  Warnings:

  - You are about to drop the column `date` on the `indicators` table. All the data in the column will be lost.
  - Made the column `status` on table `indicators` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "indicators" DROP COLUMN "date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Active';
