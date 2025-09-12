#!/usr/bin/env npx ts-node

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

// Helper function to create normalized dates at midnight UTC
const createNormalizedDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0,
            0
        )
    );
};

async function main() {
    // Clean up existing data (in correct order due to foreign key constraints)
    await prisma.responsibleJobTitle.deleteMany({});
    await prisma.indicator.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.userJobTitle.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.jobTitle.deleteMany({});

    // Only delete periods and frequencies if tables exist
    try {
        await prisma.period.deleteMany({});
    } catch (error) {
        console.log("Periods table doesn't exist yet, skipping cleanup");
    }

    try {
        await prisma.frequency.deleteMany({});
    } catch (error) {
        console.log("Frequencies table doesn't exist yet, skipping cleanup");
    }

    console.log("Seeding database...");

    // Seed Frequencies
    const frequencies = [
        { name: "รายเดือน" },
        { name: "ราย 3 เดือน" },
        { name: "รายภาคการศึกษา" },
        { name: "รายปีการศึกษา" },
        { name: "รายปีงบประมาณ" },
        { name: "Monthly" },
        { name: "Quarterly" },
        { name: "Semester" },
        { name: "Annually" },
    ];
    const frequencyRecords: Record<string, any> = {};
    for (let i = 0; i < frequencies.length; i++) {
        const frequency = frequencies[i];
        frequencyRecords[`freq${i + 1}`] = await prisma.frequency.create({
            data: frequency,
        });
    }

    // Seed Job Titles
    const jobTitles = [
        { name: "งานบริหารทั่วไป" },
        { name: "งานการเงิน การคลังพัสดุ" },
        { name: "งานบริหารงานวิจัยฯ" },
        { name: "งานนโยบายและแผนฯ" },
        { name: "หน่วยเทคโนโลยีสารสนเทศ" },
        { name: "งานบริการการศึกษาฯ" },
        { name: "หน่วยพัฒนาคุณภาพ นศ." },
        { name: "ผช.คณบดี (สื่อสารองค์กร)" },
        { name: "ผช.คณบดี (กายภาพ)" },
        { name: "ผช.คณบดี (LE)" },
        { name: "เลขานุการคณะ" },
        { name: "ศูนย์วิจัยศูนย์บริการ" },
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
    const currentDate = new Date();
    const categories = [
        {
            name: "CMUPA",
            description: "test test test 123",
            user_id: userRecords["user1"].user_id,
            created_at: currentDate,
            updated_at: currentDate,
        },
        {
            name: "HR",
            description: "HR KPIs",
            user_id: userRecords["user2"].user_id,
            created_at: currentDate,
            updated_at: currentDate,
        },
        {
            name: "Academic",
            description: "Academic KPIs",
            user_id: userRecords["user3"].user_id,
            created_at: currentDate,
            updated_at: currentDate,
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
            name: "ร้อยละบทความวิจัยได้รับการตีพิมพ์ตอบรับให้ตีพิมพ์ในฐานข้อมูล Scopus ที่สอดคล้องกับเป้าหมายการพัฒนาที่ยั่งยืน (SDGs)",
            unit: "ร้อยละ",
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวต้นแบบนวัตกรรมที่พัฒนาขึ้นด้วยความเชี่ยวชาญของมหาวิทยาลัยและตอบสนองความต้องการของผู้ใช้จริง",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนธุรกิจเกิดใหม่ (Startup/Spinoff) หรือจำนวน Technology Licensing หรือจำนวนผลงานที่บ่มเพาะ CMU-RL 8–9 ด้านสังคม เศรษฐกิจ พลังงาน อาหาร สุขภาพ และการดูแลผู้สูงอายุ",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนหลักสูตรที่มีการบูรณาการการเรียนรู้ หรือมีส่วนร่วมกับมือกับผู้ใช้บัณฑิต เพื่อเพิ่มขีดความสามารถในการแข่งขันและตอบสนองความต้องการของตลาดในอนาคต",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
        },
        {
            name: "ผลประเมินคุณภาพองค์กรตามแนวทางเกณฑ์คุณภาพการศึกษาเพื่อการดำเนินการที่เป็นเลิศ",
            unit: "ร้อยละ",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq5"].frequency_id, // รายปีงบประมาณ
            status: "Active",
            date: new Date(),
        },
        {
            name: "ร้อยละของบัณฑิตที่ได้ทำงานหรือศึกษาต่อภายใน 1 ปีหลังสำเร็จการศึกษาซึ่งได้รับการตอบรับเข้าทำงานในบริษัทยข้ามชาติ องค์กรระหว่างประเทศหรือศึกษาต่อต่างประเทศ",
            unit: "ร้อยละ",
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id, // รายปีการศึกษา
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
            frequency_id: frequencyRecords["freq7"].frequency_id, // Quarterly
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
            frequency_id: frequencyRecords["freq9"].frequency_id, // Annually
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
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนนวัตกรรมสิ่งแวดล้อม",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนนวัตกรรมสด้านอาหารและสุขภาพและการดูแลผู้สูงอายุ",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนหลักสูตรหรือโปรแกรมที่เปิด/ปรับปรุง เช่น หลักสูตรแบบพหุศาสตร์, หลักสูตรที่พัฒนาร่วมกับกับภาคอุตสาหกรรม/ภาคเอกชน, หลักสูตรควบปริญญาตรี-โท (5ปี)",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนหลักสูตร/โปรแกรมที่เปิดใหม่/ปรับปรุงเป็นหลักสูตรนานาชาติในระดับปริญญาตรี",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
        },
        {
            name: "จำนวนหลักสูตร/โครงการปริญญาคู่ร่วมกับมหาวิยาลัยชั้นนำของโลกที่เพิ่มขึ้น",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
        },
        {
            name: "HR Training Completion",
            unit: "sessions",
            target_value: 40,
            main_indicator_id: mainIndicatorRecords["main7"].indicator_id, // Sub-indicator of HR main indicator
            user_id: userRecords["user2"].user_id,
            category_id: categoryRecords["cat2"].category_id,
            frequency_id: frequencyRecords["freq6"].frequency_id, // Monthly
            status: "Active",
            date: new Date(),
        },
        {
            name: "Student Research Projects",
            unit: "projects",
            target_value: 30,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id, // Sub-indicator of Academic main indicator
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            frequency_id: frequencyRecords["freq8"].frequency_id, // Semester
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

    // Seed Responsible Persons (Link indicators to job titles)
    await prisma.responsibleJobTitle.createMany({
        data: [
            // Main indicators
            {
                indicator_id: mainIndicatorRecords["main1"].indicator_id,
                jobtitle_id: jobTitleRecords["job4"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main2"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main3"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main4"].indicator_id,
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main5"].indicator_id,
                jobtitle_id: jobTitleRecords["job4"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main6"].indicator_id,
                jobtitle_id: jobTitleRecords["job7"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main7"].indicator_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main8"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            // Sub-indicators
            {
                indicator_id: subIndicatorRecords["sub1"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub2"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub3"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub4"].indicator_id,
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub5"].indicator_id,
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub6"].indicator_id,
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub7"].indicator_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub8"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
        ],
    });

    // Seed some sample periods for different frequencies
    const samplePeriods = [
        // Monthly periods for 2024
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-01-31"),
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
        },
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-01-31"),
            frequency_id: frequencyRecords["freq6"].frequency_id, // Monthly
        },
        // Quarterly periods
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-03-31"),
            frequency_id: frequencyRecords["freq2"].frequency_id, // ราย 3 เดือน
        },
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-03-31"),
            frequency_id: frequencyRecords["freq7"].frequency_id, // Quarterly
        },
        // Academic semester periods
        {
            start_date: createNormalizedDate("2024-08-01"),
            end_date: createNormalizedDate("2024-12-31"),
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
        },
        {
            start_date: createNormalizedDate("2024-08-01"),
            end_date: createNormalizedDate("2024-12-31"),
            frequency_id: frequencyRecords["freq8"].frequency_id, // Semester
        },
        // Annual periods
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-12-31"),
            frequency_id: frequencyRecords["freq4"].frequency_id, // รายปีการศึกษา
        },
        {
            start_date: createNormalizedDate("2024-10-01"),
            end_date: createNormalizedDate("2025-09-30"),
            frequency_id: frequencyRecords["freq5"].frequency_id, // รายปีงบประมาณ
        },
        {
            start_date: createNormalizedDate("2024-01-01"),
            end_date: createNormalizedDate("2024-12-31"),
            frequency_id: frequencyRecords["freq9"].frequency_id, // Annually
        },
    ];

    await prisma.period.createMany({
        data: samplePeriods,
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
