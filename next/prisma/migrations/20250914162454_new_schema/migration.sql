/*
  Warnings:

  - You are about to drop the column `unit` on the `indicators` table. All the data in the column will be lost.
  - Added the required column `unit_id` to the `indicators` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_main_indicator_id_fkey";

-- AlterTable
ALTER TABLE "indicators" DROP COLUMN "unit",
ADD COLUMN     "unit_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "units" (
    "unit_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_main_indicator_id_fkey" FOREIGN KEY ("main_indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE CASCADE;
