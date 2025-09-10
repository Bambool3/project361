/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Indicator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndicatorDepartment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Indicator" DROP CONSTRAINT "Indicator_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Indicator" DROP CONSTRAINT "Indicator_main_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "Indicator" DROP CONSTRAINT "Indicator_responsible_user_id_fkey";

-- DropForeignKey
ALTER TABLE "IndicatorDepartment" DROP CONSTRAINT "IndicatorDepartment_department_id_fkey";

-- DropForeignKey
ALTER TABLE "IndicatorDepartment" DROP CONSTRAINT "IndicatorDepartment_indicator_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_department_id_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_role_id_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Department";

-- DropTable
DROP TABLE "Indicator";

-- DropTable
DROP TABLE "IndicatorDepartment";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "job_titles" (
    "jobtitle_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "job_titles_pkey" PRIMARY KEY ("jobtitle_id")
);

-- CreateTable
CREATE TABLE "user_job_titles" (
    "user_id" INTEGER NOT NULL,
    "jobtitle_id" INTEGER NOT NULL,

    CONSTRAINT "user_job_titles_pkey" PRIMARY KEY ("user_id","jobtitle_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "indicators" (
    "indicator_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION,
    "unit" TEXT,
    "tracking_frequency" TEXT,
    "date" TIMESTAMP(3),
    "status" TEXT,
    "main_indicator_id" INTEGER,
    "category_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "indicators_pkey" PRIMARY KEY ("indicator_id")
);

-- CreateTable
CREATE TABLE "responsible_persons" (
    "indicator_id" INTEGER NOT NULL,
    "jobtitle_id" INTEGER NOT NULL,

    CONSTRAINT "responsible_persons_pkey" PRIMARY KEY ("indicator_id","jobtitle_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_titles" ADD CONSTRAINT "user_job_titles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_job_titles" ADD CONSTRAINT "user_job_titles_jobtitle_id_fkey" FOREIGN KEY ("jobtitle_id") REFERENCES "job_titles"("jobtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_main_indicator_id_fkey" FOREIGN KEY ("main_indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicators" ADD CONSTRAINT "indicators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsible_persons" ADD CONSTRAINT "responsible_persons_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "indicators"("indicator_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsible_persons" ADD CONSTRAINT "responsible_persons_jobtitle_id_fkey" FOREIGN KEY ("jobtitle_id") REFERENCES "job_titles"("jobtitle_id") ON DELETE CASCADE ON UPDATE CASCADE;
