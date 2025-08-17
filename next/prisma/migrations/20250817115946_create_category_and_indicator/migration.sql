-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indicator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "target_value" INTEGER NOT NULL,
    "main_indicator_id" TEXT NOT NULL,
    "responsible_user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "Indicator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorDepartment" (
    "indicator_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,

    CONSTRAINT "IndicatorDepartment_pkey" PRIMARY KEY ("indicator_id","department_id")
);

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_main_indicator_id_fkey" FOREIGN KEY ("main_indicator_id") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indicator" ADD CONSTRAINT "Indicator_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorDepartment" ADD CONSTRAINT "IndicatorDepartment_indicator_id_fkey" FOREIGN KEY ("indicator_id") REFERENCES "Indicator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorDepartment" ADD CONSTRAINT "IndicatorDepartment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
