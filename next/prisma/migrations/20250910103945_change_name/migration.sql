/*
  Warnings:

  - You are about to drop the `responsible_persons` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "responsible_persons" DROP CONSTRAINT "responsible_persons_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "responsible_persons" DROP CONSTRAINT "responsible_persons_jobtitle_id_fkey";

-- DropTable
DROP TABLE "responsible_persons";

-- CreateTable
CREATE TABLE "responsible_jobTitles" (
    "indicator_id" INTEGER NOT NULL,
    "jobtitle_id" INTEGER NOT NULL,

    CONSTRAINT "responsible_jobTitles_pkey" PRIMARY KEY ("indicator_id","jobtitle_id")
);

-- AddForeignKey
ALTER TABLE "responsible_jobTitles" ADD CONSTRAINT "responsible_jobTitles_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsible_jobTitles" ADD CONSTRAINT "responsible_jobTitles_jobtitle_id_fkey" FOREIGN KEY ("jobtitle_id") REFERENCES "job_titles"("jobtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;
