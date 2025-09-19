/*
  Warnings:

  - The primary key for the `indicator_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `indicatordata_id` on the `indicator_data` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "indicator_data_indicator_id_period_id_key";

-- AlterTable
ALTER TABLE "indicator_data" DROP CONSTRAINT "indicator_data_pkey",
DROP COLUMN "indicatordata_id",
ADD CONSTRAINT "indicator_data_pkey" PRIMARY KEY ("indicator_id", "period_id");
