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
