/*
  Warnings:

  - A unique constraint covering the columns `[category_id,position,main_indicator_id]` on the table `indicators` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `position` to the `indicators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "indicators" ADD COLUMN     "position" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "indicator_data" (
    "indicatordata_id" SERIAL NOT NULL,
    "indicator_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "actual_value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "indicator_data_pkey" PRIMARY KEY ("indicatordata_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "indicator_data_indicator_id_period_id_key" ON "indicator_data"("indicator_id", "period_id");

-- CreateIndex
CREATE UNIQUE INDEX "indicator_position_unique" ON "indicators"("category_id", "position", "main_indicator_id");

-- AddForeignKey
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("period_id") ON DELETE CASCADE ON UPDATE CASCADE;
