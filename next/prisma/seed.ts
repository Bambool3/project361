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

async function main() {
    // Clean up existing data in correct order (respecting foreign key constraints)
    await prisma.responsibleJobTitle.deleteMany({});
    await prisma.indicatorData.deleteMany({});
    await prisma.indicator.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.userJobTitle.deleteMany({});
    await prisma.userRole.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.jobTitle.deleteMany({});
    await prisma.period.deleteMany({});
    await prisma.frequency.deleteMany({});

    console.log("Seeding database...");

    // Seed Frequencies first (since indicators depend on them)
    const frequencies = [
        { name: "รายเดือน", periods_in_year: 12 },
        { name: "รายไตรมาส", periods_in_year: 4 },
        { name: "รายภาคการศึกษา", periods_in_year: 2 },
        { name: "รายปีงบประมาณ", periods_in_year: 1 },
        { name: "รายปีการศึกษา", periods_in_year: 1 },
    ];

    const frequencyRecords: Record<string, any> = {};
    for (let i = 0; i < frequencies.length; i++) {
        const frequency = frequencies[i];
        frequencyRecords[`freq${i + 1}`] = await prisma.frequency.create({
            data: frequency,
        });
    }

    // Seed Periods for each frequency
    const currentYear = new Date().getFullYear();

    // Create periods for monthly frequency (freq1 - รายเดือน)
    const monthlyPeriods = [];
    for (let m = 1; m <= 12; m++) {
        const start = new Date(currentYear, m - 1, 1);
        const end = new Date(currentYear, m, 0);
        monthlyPeriods.push({
            start_date: start,
            end_date: end,
            frequency_id: frequencyRecords["freq1"].frequency_id,
        });
    }
    await prisma.period.createMany({ data: monthlyPeriods });

    // Create periods for quarterly frequency (freq2 - รายไตรมาส)
    await prisma.period.createMany({
        data: [
            {
                start_date: new Date(`${currentYear}-01-01`),
                end_date: new Date(`${currentYear}-03-31`),
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                start_date: new Date(`${currentYear}-04-01`),
                end_date: new Date(`${currentYear}-06-30`),
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                start_date: new Date(`${currentYear}-07-01`),
                end_date: new Date(`${currentYear}-09-30`),
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                start_date: new Date(`${currentYear}-10-01`),
                end_date: new Date(`${currentYear}-12-31`),
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
        ],
    });

    // Create periods for semester frequency (freq3 - รายภาคการศึกษา)
    await prisma.period.createMany({
        data: [
            {
                start_date: new Date(`${currentYear}-06-01`),
                end_date: new Date(`${currentYear}-10-31`),
                frequency_id: frequencyRecords["freq3"].frequency_id,
            },
            {
                start_date: new Date(`${currentYear}-11-01`),
                end_date: new Date(`${currentYear + 1}-03-31`),
                frequency_id: frequencyRecords["freq3"].frequency_id,
            },
        ],
    });

    // Create periods for annual frequencies
    await prisma.period.createMany({
        data: [
            {
                start_date: new Date(`${currentYear}-10-01`),
                end_date: new Date(`${currentYear + 1}-09-30`),
                frequency_id: frequencyRecords["freq4"].frequency_id, // รายปีงบประมาณ
            },
            {
                start_date: new Date(`${currentYear}-06-01`),
                end_date: new Date(`${currentYear + 1}-05-31`),
                frequency_id: frequencyRecords["freq5"].frequency_id, // รายปีการศึกษา
            },
        ],
    });

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
        { name: "ผู้ดูแลระบบ" },
        { name: "ฝ่ายแผน" },
        { name: "บุคลากร" },
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
            first_name: "แอดมิน",
            last_name: "ดูแลระบบ",
            email: "admin@gmail.com",
            password: await bcrypt.hash("10", 10),
        },
        {
            first_name: "อลิซ",
            last_name: "ฝ่ายแผน",
            email: "alice@gmail.com",
            password: await bcrypt.hash("11", 10),
        },
        {
            first_name: "บ๊อบ",
            last_name: "บุคลากร",
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
                role_id: roleRecords["role2"].role_id,
            },
            {
                user_id: userRecords["user3"].user_id,
                role_id: roleRecords["role3"].role_id,
            },
        ],
    });

    // Seed User Job Titles
    await prisma.userJobTitle.createMany({
        data: [
            {
                user_id: userRecords["user1"].user_id,
                jobtitle_id: jobTitleRecords["job1"].jobtitle_id,
            },
            {
                user_id: userRecords["user2"].user_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
            },
            {
                user_id: userRecords["user3"].user_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
        ],
    });

    // Seed Categories (with required timestamps)
    const now = new Date();
    const categories = [
        {
            name: "CMUPA",
            description: "test test test 123",
            user_id: userRecords["user1"].user_id,
            created_at: now,
            updated_at: now,
        },
        {
            name: "HR",
            description: "HR KPIs",
            user_id: userRecords["user2"].user_id,
            created_at: now,
            updated_at: now,
        },
        {
            name: "Academic",
            description: "Academic KPIs",
            user_id: userRecords["user3"].user_id,
            created_at: now,
            updated_at: now,
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
    // Position is unique per category for main indicators
    const mainIndicators = [
        {
            name: "ร้อยละบทความวิจัยได้รับการตีพิมพ์ตอบรับให้ตีพิมพ์ในฐานข้อมูล Scopus ที่สอดคล้องกับเป้าหมายการพัฒนาที่ยั่งยืน (SDGs)",
            unit: "ร้อยละ",
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First indicator in CMUPA category
        },
        {
            name: "จำนวนต้นแบบนวัตกรรมที่พัฒนาขึ้นด้วยความเชี่ยวชาญของมหาวิทยาลัยและตอบสนองความต้องการของผู้ใช้จริง",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 2, // Second indicator in CMUPA category
        },
        {
            name: "จำนวนธุรกิจเกิดใหม่ (Startup/Spinoff) หรือจำนวน Technology Licensing หรือจำนวนผลงานที่บ่มเพาะ CMU-RL 8–9 ด้านสังคม เศรษฐกิจ พลังงาน อาหาร สุขภาพ และการดูแลผู้สูงอายุ",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 3, // Third indicator in CMUPA category
        },
        {
            name: "จำนวนหลักสูตรที่มีการบูรณาการการเรียนรู้ หรือมีส่วนร่วมกับผู้ใช้บัณฑิต เพื่อเพิ่มขีดความสามารถในการแข่งขันและตอบสนองความต้องการของตลาดในอนาคต",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 4, // Fourth indicator in CMUPA category
        },
        {
            name: "ผลประเมินคุณภาพองค์กรตามแนวทางเกณฑ์คุณภาพการศึกษาเพื่อการดำเนินการที่เป็นเลิศ",
            unit: "ร้อยละ",
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 5, // Fifth indicator in CMUPA category
        },
        {
            name: "ร้อยละของบัณฑิตที่ได้ทำงานหรือศึกษาต่อภายใน 1 ปีหลังสำเร็จการศึกษาซึ่งได้รับการตอบรับเข้าทำงานในบริษัทข้ามชาติ องค์กรระหว่างประเทศหรือศึกษาต่อต่างประเทศ",
            unit: "ร้อยละ",
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq5"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 6, // Sixth indicator in CMUPA category
        },
        {
            name: "HR Efficiency",
            unit: "points",
            target_value: 80,
            main_indicator_id: null,
            user_id: userRecords["user2"].user_id,
            category_id: categoryRecords["cat2"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First indicator in HR category
        },
        {
            name: "Academic Publications",
            unit: "papers",
            target_value: 60,
            main_indicator_id: null,
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First indicator in Academic category
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
    // Position is unique per parent (main_indicator_id) for sub-indicators
    const subIndicators = [
        {
            name: "จำนวนผลงานวิจัย CMU-RL 4-7",
            unit: "เล่ม",
            target_value: 50,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main2
        },
        {
            name: "จำนวนนวัตกรรมสิ่งแวดล้อม",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 2, // Second sub-indicator under main2
        },
        {
            name: "จำนวนนวัตกรรมด้านอาหารและสุขภาพและการดูแลผู้สูงอายุ",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main2"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 3, // Third sub-indicator under main2
        },
        {
            name: "จำนวนหลักสูตรหรือโปรแกรมที่เปิด/ปรับปรุง เช่น หลักสูตรแบบพหุศาสตร์, หลักสูตรที่พัฒนาร่วมกับภาคอุตสาหกรรม/ภาคเอกชน, หลักสูตรควบปริญญาตรี-โท (5ปี)",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main4
        },
        {
            name: "จำนวนหลักสูตร/โปรแกรมที่เปิดใหม่/ปรับปรุงเป็นหลักสูตรนานาชาติในระดับปริญญาตรี",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 2, // Second sub-indicator under main4
        },
        {
            name: "จำนวนหลักสูตร/โครงการปริญญาคู่ร่วมกับมหาวิทยาลัยชั้นนำของโลกที่เพิ่มขึ้น",
            unit: "เล่ม",
            target_value: 25,
            main_indicator_id: mainIndicatorRecords["main4"].indicator_id,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 3, // Third sub-indicator under main4
        },
        {
            name: "HR Training Completion",
            unit: "sessions",
            target_value: 40,
            main_indicator_id: mainIndicatorRecords["main7"].indicator_id,
            user_id: userRecords["user2"].user_id,
            category_id: categoryRecords["cat2"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main7 (HR Efficiency)
        },
        {
            name: "Student Research Projects",
            unit: "projects",
            target_value: 30,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id,
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main8 (Academic Publications)
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
                indicator_id: mainIndicatorRecords["main1"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main1"].indicator_id,
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
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
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
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
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
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