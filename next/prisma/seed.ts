import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.responsiblePerson.deleteMany({});
    await prisma.indicator.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.userJobTitle.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.jobTitle.deleteMany({});

    console.log("Seeding database...");

    // Seed Job Titles
    const jobTitles = [
        { name: "Administrator" },
        { name: "HR Manager" },
        { name: "Academic Staff" },
        { name: "Research Director" },
    ];
    const jobTitleRecords: Record<string, any> = {};
    for (let i = 0; i < jobTitles.length; i++) {
        const jobTitle = jobTitles[i];
        jobTitleRecords[`job${i + 1}`] = await prisma.jobTitle.create({
            data: jobTitle,
        });
    }

    // Seed Roles
    const roles = [
        { name: "Administrator" },
        { name: "Staff" },
        { name: "Manager" },
    ];
    const roleRecords: Record<string, any> = {};
    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        roleRecords[`role${i + 1}`] = await prisma.role.create({
            data: role,
        });
    }

    // Seed Users
    const users = [
        {
            first_name: "Admin",
            last_name: "User",
            email: "admin@gmail.com",
            password: await bcrypt.hash("10", 10),
        },
        {
            first_name: "Alice",
            last_name: "Staff",
            email: "alice@gmail.com",
            password: await bcrypt.hash("11", 10),
        },
        {
            first_name: "Bob",
            last_name: "Manager",
            email: "bob@gmail.com",
            password: await bcrypt.hash("12", 10),
        },
    ];
    const userRecords: Record<string, any> = {};
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        userRecords[`user${i + 1}`] = await prisma.user.create({
            data: user,
        });
    }

    // Seed User Roles
    await prisma.userRole.createMany({
        data: [
            {
                user_id: userRecords["user1"].user_id,
                role_id: roleRecords["role1"].role_id, // Admin role
            },
            {
                user_id: userRecords["user2"].user_id,
                role_id: roleRecords["role2"].role_id, // Staff role
            },
            {
                user_id: userRecords["user3"].user_id,
                role_id: roleRecords["role3"].role_id, // Manager role
            },
        ],
    });

    // Seed User Job Titles
    await prisma.userJobTitle.createMany({
        data: [
            {
                user_id: userRecords["user1"].user_id,
                jobtitle_id: jobTitleRecords["job1"].jobtitle_id, // Administrator
            },
            {
                user_id: userRecords["user2"].user_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id, // HR Manager
            },
            {
                user_id: userRecords["user3"].user_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id, // Academic Staff
            },
        ],
    });

    // Seed Categories
    const categories = [
        { 
            name: "CMUPA", 
            description: "test test test 123",
            user_id: userRecords["user1"].user_id,
        },
        { 
            name: "HR", 
            description: "HR KPIs",
            user_id: userRecords["user2"].user_id,
        },
        { 
            name: "Academic", 
            description: "Academic KPIs",
            user_id: userRecords["user3"].user_id,
        },
    ];
    const categoryRecords: Record<string, any> = {};
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        categoryRecords[`cat${i + 1}`] = await prisma.category.create({
            data: category,
        });
    }

    // First, create main indicators (without main_indicator_id)
    const mainIndicators = [
        {
            name: "จำนวนต้นแบบนวัตกรรม",
            unit: "10 เล่ม",
            target_value: 100,
            main_indicator_id: null, // This is a main indicator
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            tracking_frequency: "Monthly",
            status: "Active",
            date: new Date(),
        },
        {
            name: "HR Efficiency",
            unit: "points",
            target_value: 80,
            main_indicator_id: null, // This is a main indicator
            user_id: userRecords["user2"].user_id,
            category_id: categoryRecords["cat2"].category_id,
            tracking_frequency: "Quarterly",
            status: "Active",
            date: new Date(),
        },
        {
            name: "Academic Publications",
            unit: "papers",
            target_value: 60,
            main_indicator_id: null, // This is a main indicator
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            tracking_frequency: "Annually",
            status: "Active",
            date: new Date(),
        },
    ];

    const mainIndicatorRecords: Record<string, any> = {};
    for (let i = 0; i < mainIndicators.length; i++) {
        const indicator = mainIndicators[i];
        mainIndicatorRecords[`main${i + 1}`] = await prisma.indicator.create({
            data: indicator,
        });
    }

    // Then create sub-indicators that reference main indicators
    const subIndicators = [
        {
            name: "จำนวนผลงานวิจัย CMU-RL 4-7",
            unit: "10 เล่ม",
            target_value: 50,
            main_indicator_id: mainIndicatorRecords["main1"].indicator_id, // Sub-indicator of first main indicator
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            tracking_frequency: "Monthly",
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนนวัตกรรมสิ่งแวดล้อม",
            unit: "10 เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main1"].indicator_id, // Sub-indicator of first main indicator
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            tracking_frequency: "Monthly",
            status: "Active",
            date: new Date(),
        },
        {
            name: "HR Training Completion",
            unit: "sessions",
            target_value: 40,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id, // Sub-indicator of HR main indicator
            user_id: userRecords["user2"].user_id,
            category_id: categoryRecords["cat2"].category_id,
            tracking_frequency: "Monthly",
            status: "Active",
            date: new Date(),
        },
        {
            name: "Student Research Projects",
            unit: "projects",
            target_value: 30,
            main_indicator_id: mainIndicatorRecords["main3"].indicator_id, // Sub-indicator of Academic main indicator
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            tracking_frequency: "Semester",
            status: "Active",
            date: new Date(),
        },
    ];

    const subIndicatorRecords: Record<string, any> = {};
    for (let i = 0; i < subIndicators.length; i++) {
        const indicator = subIndicators[i];
        subIndicatorRecords[`sub${i + 1}`] = await prisma.indicator.create({
            data: indicator,
        });
    }

    // Combine all indicators for responsible person seeding
    const allIndicators = {
        ...mainIndicatorRecords,
        ...subIndicatorRecords,
    };

    // Seed Responsible Persons (Link indicators to job titles)
    await prisma.responsiblePerson.createMany({
        data: [
            // Main indicators
            {
                indicator_id: mainIndicatorRecords["main1"].indicator_id,
                jobtitle_id: jobTitleRecords["job4"].jobtitle_id, // Research Director
            },
            {
                indicator_id: mainIndicatorRecords["main2"].indicator_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id, // HR Manager
            },
            {
                indicator_id: mainIndicatorRecords["main3"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id, // Academic Staff
            },
            // Sub-indicators
            {
                indicator_id: subIndicatorRecords["sub1"].indicator_id,
                jobtitle_id: jobTitleRecords["job4"].jobtitle_id, // Research Director
            },
            {
                indicator_id: subIndicatorRecords["sub2"].indicator_id,
                jobtitle_id: jobTitleRecords["job4"].jobtitle_id, // Research Director
            },
            {
                indicator_id: subIndicatorRecords["sub3"].indicator_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id, // HR Manager
            },
            {
                indicator_id: subIndicatorRecords["sub4"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id, // Academic Staff
            },
        ],
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