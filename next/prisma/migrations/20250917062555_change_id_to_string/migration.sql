/*
  Warnings:

  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `frequencies` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `indicator_data` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `indicators` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `job_titles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `periods` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `responsible_jobTitles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `units` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_job_titles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user_roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "indicator_data" DROP CONSTRAINT "indicator_data_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "indicator_data" DROP CONSTRAINT "indicator_data_period_id_fkey";

-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_category_id_fkey";

-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_frequency_id_fkey";

-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_main_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_unit_id_fkey";

-- DropForeignKey
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_user_id_fkey";

-- DropForeignKey
ALTER TABLE "periods" DROP CONSTRAINT "periods_frequency_id_fkey";

-- DropForeignKey
ALTER TABLE "responsible_jobTitles" DROP CONSTRAINT "responsible_jobTitles_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "responsible_jobTitles" DROP CONSTRAINT "responsible_jobTitles_jobtitle_id_fkey";

-- DropForeignKey
ALTER TABLE "user_job_titles" DROP CONSTRAINT "user_job_titles_jobtitle_id_fkey";

-- DropForeignKey
ALTER TABLE "user_job_titles" DROP CONSTRAINT "user_job_titles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
ALTER COLUMN "category_id" DROP DEFAULT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id");
DROP SEQUENCE "categories_category_id_seq";

-- AlterTable
ALTER TABLE "frequencies" DROP CONSTRAINT "frequencies_pkey",
ALTER COLUMN "frequency_id" DROP DEFAULT,
ALTER COLUMN "frequency_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "frequencies_pkey" PRIMARY KEY ("frequency_id");
DROP SEQUENCE "frequencies_frequency_id_seq";

-- AlterTable
ALTER TABLE "indicator_data" DROP CONSTRAINT "indicator_data_pkey",
ALTER COLUMN "indicatordata_id" DROP DEFAULT,
ALTER COLUMN "indicatordata_id" SET DATA TYPE TEXT,
ALTER COLUMN "indicator_id" SET DATA TYPE TEXT,
ALTER COLUMN "period_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "indicator_data_pkey" PRIMARY KEY ("indicatordata_id");
DROP SEQUENCE "indicator_data_indicatordata_id_seq";

-- AlterTable
ALTER TABLE "indicators" DROP CONSTRAINT "indicators_pkey",
ALTER COLUMN "indicator_id" DROP DEFAULT,
ALTER COLUMN "indicator_id" SET DATA TYPE TEXT,
ALTER COLUMN "main_indicator_id" SET DATA TYPE TEXT,
ALTER COLUMN "category_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "frequency_id" SET DATA TYPE TEXT,
ALTER COLUMN "unit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "indicators_pkey" PRIMARY KEY ("indicator_id");
DROP SEQUENCE "indicators_indicator_id_seq";

-- AlterTable
ALTER TABLE "job_titles" DROP CONSTRAINT "job_titles_pkey",
ALTER COLUMN "jobtitle_id" DROP DEFAULT,
ALTER COLUMN "jobtitle_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "job_titles_pkey" PRIMARY KEY ("jobtitle_id");
DROP SEQUENCE "job_titles_jobtitle_id_seq";

-- AlterTable
ALTER TABLE "periods" DROP CONSTRAINT "periods_pkey",
ALTER COLUMN "period_id" DROP DEFAULT,
ALTER COLUMN "period_id" SET DATA TYPE TEXT,
ALTER COLUMN "frequency_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "periods_pkey" PRIMARY KEY ("period_id");
DROP SEQUENCE "periods_period_id_seq";

-- AlterTable
ALTER TABLE "responsible_jobTitles" DROP CONSTRAINT "responsible_jobTitles_pkey",
ALTER COLUMN "indicator_id" SET DATA TYPE TEXT,
ALTER COLUMN "jobtitle_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "responsible_jobTitles_pkey" PRIMARY KEY ("indicator_id", "jobtitle_id");

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
ALTER COLUMN "role_id" DROP DEFAULT,
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id");
DROP SEQUENCE "roles_role_id_seq";

-- AlterTable
ALTER TABLE "units" DROP CONSTRAINT "units_pkey",
ALTER COLUMN "unit_id" DROP DEFAULT,
ALTER COLUMN "unit_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id");
DROP SEQUENCE "units_unit_id_seq";

-- AlterTable
ALTER TABLE "user_job_titles" DROP CONSTRAINT "user_job_titles_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "jobtitle_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_job_titles_pkey" PRIMARY KEY ("user_id", "jobtitle_id");

-- AlterTable
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "role_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");
DROP SEQUENCE "users_user_id_seq";

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_titles" ADD CONSTRAINT "user_job_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_titles" ADD CONSTRAINT "user_job_titles_jobtitle_id_fkey" FOREIGN KEY ("jobtitle_id") REFERENCES "job_titles"("jobtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_main_indicator_id_fkey" FOREIGN KEY ("main_indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_frequency_id_fkey" FOREIGN KEY ("frequency_id") REFERENCES "frequencies"("frequency_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsible_jobTitles" ADD CONSTRAINT "responsible_jobTitles_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsible_jobTitles" ADD CONSTRAINT "responsible_jobTitles_jobtitle_id_fkey" FOREIGN KEY ("jobtitle_id") REFERENCES "job_titles"("jobtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periods" ADD CONSTRAINT "periods_frequency_id_fkey" FOREIGN KEY ("frequency_id") REFERENCES "frequencies"("frequency_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicator_data" ADD CONSTRAINT "indicator_data_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "periods"("period_id") ON DELETE CASCADE ON UPDATE CASCADE;
