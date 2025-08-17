import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // Create Department
    const adminDepartment = await prisma.department.upsert({
        where: { id: "dept_admin" },
        update: {},
        create: {
            id: "dept_admin",
            department_name: "Administration",
        },
    });

    // Create Role
    const adminRole = await prisma.role.upsert({
        where: { id: "role_admin" },
        update: {},
        create: {
            id: "role_admin",
            role_name: "Administrator",
        },
    });

    // Create Admin User
    const password = "10";
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
        where: { id: "a1" },
        update: {},
        create: {
            id: "a1",
            first_name: "Admin",
            last_name: "User",
            email: "admin@gmail.com",
            password: hashedPassword,
            role_id: adminRole.id,
            department_id: adminDepartment.id,
        },
    });

    // Create Category(cmupa)
    const cmupa = await prisma.category.upsert({
        where: { id: "01" },
        update: {},
        create: {
            id: "01",
            name: "CMUPA",
            description: "test test test 123"
        },
    });

    // Create Indicator
    const indicator01 = await prisma.indicator.upsert({
        where: { id: "IN01" },
        update: {},
        create: {
            id: "IN01",
            name: "จำนวนต้นแบบนวัตกรรม",
            unit: "10 เล่ม",
            target_value: 100,
            main_indicator_id: "IN01",
            responsible_user_id: adminUser.id,
            category_id: cmupa.id,

        },
    });

    const indicator01_01 = await prisma.indicator.upsert({
        where: { id: "0101" },
        update: {},
        create: {
            id: "0101",
            name: "จำนวนผลงานวิจัย CMU-RL 4-7",
            unit: "10 เล่ม",
            target_value: 50,
            main_indicator_id: indicator01.id,
            responsible_user_id: adminUser.id,
            category_id: cmupa.id,
        },
    });

    const indicator01_02 = await prisma.indicator.upsert({
        where: { id: "0102" },
        update: {},
        create: {
            id: "0102",
            name: "จำนวนนวัตกรรมสิ่งแวดล้อม",
            unit: "10 เล่ม",
            target_value: 25,
            main_indicator_id: indicator01.id,
            responsible_user_id: adminUser.id,
            category_id: cmupa.id,
        },
    });

    const indicator01_03 = await prisma.indicator.upsert({
        where: { id: "0103" },
        update: {},
        create: {
            id: "0103",
            name: "จำนวนนวัตกรรมด้านอาหาร",
            unit: "10 เล่ม",
            target_value: 25,
            main_indicator_id: indicator01.id,
            responsible_user_id: adminUser.id,
            category_id: cmupa.id,
        },
    });

    const indicatorDepartment = await prisma.indicatorDepartment.upsert({
        where: {
            indicator_id_department_id: {
              indicator_id: indicator01.id,
              department_id: adminDepartment.id,
            },
        },
        update: {},
        create: {
            indicator_id: indicator01.id,
            department_id: adminDepartment.id
        },
    });
    
    console.log("Database Seeded Successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
