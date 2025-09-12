/*
  Warnings:

  - You are about to drop the column `tracking_frequency` on the `indicators` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `frequency_id` to the `indicators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "indicators" DROP COLUMN "tracking_frequency",
ADD COLUMN     "frequency_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "frequencies" (
    "frequency_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "frequencies_pkey" PRIMARY KEY ("frequency_id")
);

-- CreateTable
CREATE TABLE "periods" (
    "period_id" SERIAL NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "frequency_id" INTEGER NOT NULL,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("period_id")
);

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_frequency_id_fkey" FOREIGN KEY ("frequency_id") REFERENCES "frequencies"("frequency_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_frequency_id_fkey" FOREIGN KEY ("frequency_id") REFERENCES "frequencies"("frequency_id") ON DELETE CASCADE ON UPDATE CASCADE;
