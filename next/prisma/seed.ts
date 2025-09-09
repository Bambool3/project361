import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    await prisma.indicatorDepartment.deleteMany({});
    await prisma.indicator.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.department.deleteMany({});

    console.log("Seeding database...");

    // Seed Departments
    const departments = [
        { id: "dept_admin", department_name: "Administration" },
        { id: "dept_hr", department_name: "Human Resources" },
        { id: "dept_acad", department_name: "Academic" },
    ];
    const departmentRecords: Record<string, any> = {};
    for (const dept of departments) {
        departmentRecords[dept.id] = await prisma.department.upsert({
            where: { department_name: dept.department_name },
            update: {},
            create: dept,
        });
    }

    // Seed Roles
    const roles = [
        { id: "admin", role_name: "Administrator" },
        { id: "staff", role_name: "Staff" },
    ];
    const roleRecords: Record<string, any> = {};
    for (const role of roles) {
        roleRecords[role.id] = await prisma.role.upsert({
            where: { role_name: role.role_name },
            update: {},
            create: role,
        });
    }

    // Seed Users
    const users = [
        {
            id: "a1",
            first_name: "Admin",
            last_name: "User",
            email: "admin@gmail.com",
            password: await bcrypt.hash("10", 10),
            role_id: roleRecords["admin"].id,
            department_id: departmentRecords["dept_admin"].id,
        },
        {
            id: "u2",
            first_name: "Alice",
            last_name: "Staff",
            email: "alice@gmail.com",
            password: await bcrypt.hash("11", 10),
            role_id: roleRecords["staff"].id,
            department_id: departmentRecords["dept_hr"].id,
        },
    ];
    const userRecords: Record<string, any> = {};
    for (const user of users) {
        userRecords[user.id] = await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    // Seed Categories
    const categories = [
        { id: "cat1", name: "CMUPA", description: "test test test 123" },
        { id: "cat2", name: "HR", description: "HR KPIs" },
        { id: "cat3", name: "Academic", description: "Academic KPIs" },
    ];
    const categoryRecords: Record<string, any> = {};
    for (const cat of categories) {
        categoryRecords[cat.id] = await prisma.category.upsert({
            where: { id: cat.id },
            update: {},
            create: cat,
        });
    }

    // Indicators and Sub-Indicators
    const indicators = [
        // CMUPA indicators
        {
            id: "IN01",
            name: "จำนวนต้นแบบนวัตกรรม",
            unit: "10 เล่ม",
            target_value: 100,
            main_indicator_id: null,
            responsible_user_id: userRecords["a1"].id,
            category_id: categoryRecords["cat1"].id,
        },
        {
            id: "IN01-1",
            name: "จำนวนผลงานวิจัย CMU-RL 4-7",
            unit: "10 เล่ม",
            target_value: 50,
            main_indicator_id: "IN01",
            responsible_user_id: userRecords["a1"].id,
            category_id: categoryRecords["cat1"].id,
        },
        {
            id: "IN01-2",
            name: "จำนวนนวัตกรรมสิ่งแวดล้อม",
            unit: "10 เล่ม",
            target_value: 25,
            main_indicator_id: "IN01",
            responsible_user_id: userRecords["a1"].id,
            category_id: categoryRecords["cat1"].id,
        },
        // HR indicators
        {
            id: "IN02",
            name: "HR Efficiency",
            unit: "points",
            target_value: 80,
            main_indicator_id: null,
            responsible_user_id: userRecords["u2"].id,
            category_id: categoryRecords["cat2"].id,
        },
        {
            id: "IN02-1",
            name: "HR Training Completion",
            unit: "sessions",
            target_value: 40,
            main_indicator_id: "IN02",
            responsible_user_id: userRecords["u2"].id,
            category_id: categoryRecords["cat2"].id,
        },
        // Academic indicators
        {
            id: "IN03",
            name: "Academic Publications",
            unit: "papers",
            target_value: 60,
            main_indicator_id: null,
            responsible_user_id: userRecords["u2"].id,
            category_id: categoryRecords["cat3"].id,
        },
        {
            id: "IN03-1",
            name: "Student Research Projects",
            unit: "projects",
            target_value: 30,
            main_indicator_id: "IN03",
            responsible_user_id: userRecords["u2"].id,
            category_id: categoryRecords["cat3"].id,
        },
    ];
    const indicatorRecords: Record<string, any> = {};
    for (const ind of indicators) {
        indicatorRecords[ind.id] = await prisma.indicator.upsert({
            where: { id: ind.id },
            update: {},
            create: ind,
        });
    }

    // Link indicators to departments
    for (const indId of Object.keys(indicatorRecords)) {
        await prisma.indicatorDepartment.upsert({
            where: {
                indicator_id_department_id: {
                    indicator_id: indicatorRecords[indId].id,
                    department_id: departmentRecords["dept_admin"].id,
                },
            },
            update: {},
            create: {
                indicator_id: indicatorRecords[indId].id,
                department_id: departmentRecords["dept_admin"].id,
            },
        });
    }

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
