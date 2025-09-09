-- DropForeignKey
ALTER TABLE "Indicator" DROP CONSTRAINT "Indicator_main_indicator_id_fkey";

-- AlterTable
ALTER TABLE "Indicator" ALTER COLUMN "main_indicator_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_main_indicator_id_fkey" FOREIGN KEY ("main_indicator_id") REFERENCES "Indicator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
