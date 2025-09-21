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
    await prisma.unit.deleteMany({});

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
        frequencyRecords[`freq${i + 1}`] = await prisma.frequency.create({
            data: frequencies[i],
        });
    }
    
    // --- Periods ---
    const currentYear = new Date().getFullYear();
    const monthNames = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
    ];
    
    // --- Monthly ---
    const monthlyPeriods = [];
    for (let m = 1; m <= 12; m++) {
        const start = new Date(currentYear, m - 1, 1);
        const end = new Date(currentYear, m, 0);
        // สร้าง notification_date 7 วันก่อนสิ้นสุด period
        const notification = new Date(end);
        notification.setDate(notification.getDate() - 7);
    
        monthlyPeriods.push({
            name: `${monthNames[m - 1]} ${currentYear}`,
            start_date: start,
            end_date: end,
            notification_date: notification, // ✨ เพิ่มฟิลด์ใหม่
            frequency_id: frequencyRecords["freq1"].frequency_id,
        });
    }
    await prisma.period.createMany({ data: monthlyPeriods });
    
    // --- Quarterly ---
    await prisma.period.createMany({
        data: [
            {
                name: `ไตรมาส 1/${currentYear}`,
                start_date: new Date(`${currentYear}-01-01`),
                end_date: new Date(`${currentYear}-03-31`),
                notification_date: new Date(`${currentYear}-03-24`), 
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                name: `ไตรมาส 2/${currentYear}`,
                start_date: new Date(`${currentYear}-04-01`),
                end_date: new Date(`${currentYear}-06-30`),
                notification_date: new Date(`${currentYear}-06-23`), 
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                name: `ไตรมาส 3/${currentYear}`,
                start_date: new Date(`${currentYear}-07-01`),
                end_date: new Date(`${currentYear}-09-30`),
                notification_date: new Date(`${currentYear}-09-23`), 
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
            {
                name: `ไตรมาส 4/${currentYear}`,
                start_date: new Date(`${currentYear}-10-01`),
                end_date: new Date(`${currentYear}-12-31`),
                notification_date: new Date(`${currentYear}-12-24`), 
                frequency_id: frequencyRecords["freq2"].frequency_id,
            },
        ],
    });
    
    // --- Semester ---
    await prisma.period.createMany({
        data: [
            {
                name: `เทอม 1/${currentYear}`,
                start_date: new Date(`${currentYear}-06-01`),
                end_date: new Date(`${currentYear}-10-31`),
                notification_date: new Date(`${currentYear}-10-24`), 
                frequency_id: frequencyRecords["freq3"].frequency_id,
            },
            {
                name: `เทอม 2/${currentYear}`,
                start_date: new Date(`${currentYear}-11-01`),
                end_date: new Date(`${currentYear + 1}-03-31`),
                notification_date: new Date(`${currentYear + 1}-03-24`), 
                frequency_id: frequencyRecords["freq3"].frequency_id,
            },
        ],
    });
    
    // --- Annuals ---
    await prisma.period.createMany({
        data: [
            {
                name: `ปีงบประมาณ ${currentYear}`,
                start_date: new Date(`${currentYear}-10-01`),
                end_date: new Date(`${currentYear + 1}-09-30`),
                notification_date: new Date(`${currentYear + 1}-09-23`), 
                frequency_id: frequencyRecords["freq4"].frequency_id,
            },
            {
                name: `ปีการศึกษา ${currentYear}`,
                start_date: new Date(`${currentYear}-06-01`),
                end_date: new Date(`${currentYear + 1}-05-31`),
                notification_date: new Date(`${currentYear + 1}-05-24`), 
                frequency_id: frequencyRecords["freq5"].frequency_id,
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
    // Seed Units
    const units = [
        // หน่วยบุคคล / จำนวนคน
        { name: "คน" },
        { name: "ครอบครัว" },
        { name: "นักเรียน" },
        { name: "ครู" },
        { name: "เจ้าหน้าที่" },

        // หน่วยกิจกรรม / ครั้ง
        { name: "ครั้ง" },
        { name: "กิจกรรม" },
        { name: "โครงการ" },
        { name: "ชั่วโมง" }, // เวลาที่ใช้

        // หน่วยการศึกษา / งานวิจัย
        { name: "เล่ม" },
        { name: "ชุด" },
        { name: "ห้องเรียน" },
        { name: "หลักสูตร" },
        { name: "งานวิจัย" },
        { name: "บทความ" },

        // หน่วยการเงิน / งบประมาณ
        { name: "บาท" },
        { name: "ล้านบาท" },

        // หน่วยทั่วไป / KPI
        { name: "ร้อยละ" },
        { name: "เครื่อง" },
        { name: "หน่วย" },
    ];

    const unitRecords: Record<string, any> = {};
    for (let i = 0; i < units.length; i++) {
        const unit = units[i];
        unitRecords[`unit${i + 1}`] = await prisma.unit.create({
            data: unit,
        });
    }

    // First, create main indicators (without main_indicator_id)
    // Position is unique per category for main indicators
    const mainIndicators = [
        {
            name: "ร้อยละบทความวิจัยได้รับการตีพิมพ์ตอบรับให้ตีพิมพ์ในฐานข้อมูล Scopus ที่สอดคล้องกับเป้าหมายการพัฒนาที่ยั่งยืน (SDGs)",
            unit_id: unitRecords["unit18"].unit_id,
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 1, // First indicator in CMUPA category
        },
        {
            name: "จำนวนต้นแบบนวัตกรรมที่พัฒนาขึ้นด้วยความเชี่ยวชาญของมหาวิทยาลัยและตอบสนองความต้องการของผู้ใช้จริง",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 2, // Second indicator in CMUPA category
        },
        {
            name: "จำนวนธุรกิจเกิดใหม่ (Startup/Spinoff) หรือจำนวน Technology Licensing หรือจำนวนผลงานที่บ่มเพาะ CMU-RL 8–9 ด้านสังคม เศรษฐกิจ พลังงาน อาหาร สุขภาพ และการดูแลผู้สูงอายุ",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 3, // Third indicator in CMUPA category
        },
        {
            name: "จำนวนหลักสูตรที่มีการบูรณาการการเรียนรู้ หรือมีส่วนร่วมกับผู้ใช้บัณฑิต เพื่อเพิ่มขีดความสามารถในการแข่งขันและตอบสนองความต้องการของตลาดในอนาคต",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
            position: 4, // Fourth indicator in CMUPA category
        },
        {
            name: "ผลประเมินคุณภาพองค์กรตามแนวทางเกณฑ์คุณภาพการศึกษาเพื่อการดำเนินการที่เป็นเลิศ",
            unit_id: unitRecords["unit18"].unit_id,
            target_value: 50,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id, // รายปีงบประมาณ
            status: "Active",
            date: new Date(),
            position: 5, // Fifth indicator in CMUPA category
        },
        {
            name: "ร้อยละของบัณฑิตที่ได้ทำงานหรือศึกษาต่อภายใน 1 ปีหลังสำเร็จการศึกษาซึ่งได้รับการตอบรับเข้าทำงานในบริษัทข้ามชาติ องค์กรระหว่างประเทศหรือศึกษาต่อต่างประเทศ",
            unit_id: unitRecords["unit18"].unit_id,
            target_value: 100,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq5"].frequency_id, // รายปีการศึกษา
            status: "Active",
            date: new Date(),
            position: 6, // Sixth indicator in CMUPA category
        },
        // New CMUPA indicators with different frequencies
        {
            name: "จำนวนนักศึกษาต่างชาติที่เข้าศึกษาในหลักสูตรนานาชาติ",
            unit_id: unitRecords["unit14"].unit_id, // คน
            target_value: 150,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 7, // Seventh indicator in CMUPA category
        },
        {
            name: "จำนวนโครงการวิจัยร่วมกับภาคอุตสาหกรรม",
            unit_id: unitRecords["unit10"].unit_id, // โครงการ
            target_value: 30,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 8, // Eighth indicator in CMUPA category
        },
        {
            name: "ร้อยละความพึงพอใจของนักศึกษาต่อคุณภาพการเรียนการสอน",
            unit_id: unitRecords["unit18"].unit_id, // เปอร์เซ็นต์
            target_value: 85,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id, // รายภาคการศึกษา
            status: "Active",
            date: new Date(),
            position: 9, // Ninth indicator in CMUPA category
        },
        {
            name: "จำนวนสิทธิบัตรที่ได้รับการจดทะเบียน",
            unit_id: unitRecords["unit10"].unit_id, // รายการ
            target_value: 20,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 10, // Tenth indicator in CMUPA category
        },
        {
            name: "งบประมาณการวิจัยที่ได้รับจากแหล่งทุนภายนอก",
            unit_id: unitRecords["unit2"].unit_id, // บาท
            target_value: 50000000,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq4"].frequency_id, // รายปีงบประมาณ
            status: "Active",
            date: new Date(),
            position: 11, // Eleventh indicator in CMUPA category
        },
        {
            name: "จำนวนผู้เข้าร่วมกิจกรรมบริการวิชาการแก่สังคม",
            unit_id: unitRecords["unit14"].unit_id, // คน
            target_value: 500,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 12, // Twelfth indicator in CMUPA category
        },
        {
            name: "ร้อยละการคงอยู่ของนักศึกษา (Student Retention Rate)",
            unit_id: unitRecords["unit18"].unit_id, // เปอร์เซ็นต์
            target_value: 92,
            main_indicator_id: null,
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq5"].frequency_id, // รายปีการศึกษา
            status: "Active",
            date: new Date(),
            position: 13, // Thirteenth indicator in CMUPA category
        },
        {
            name: "HR Efficiency",
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit18"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit10"].unit_id,
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
            unit_id: unitRecords["unit12"].unit_id,
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
            unit_id: unitRecords["unit8"].unit_id,
            target_value: 30,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id,
            user_id: userRecords["user3"].user_id,
            category_id: categoryRecords["cat3"].category_id,
            frequency_id: frequencyRecords["freq3"].frequency_id,
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main8 (Academic Publications)
        },
        // Sub-indicators for new CMUPA indicators
        {
            name: "นักศึกษาต่างชาติระดับปริญญาตรี",
            unit_id: unitRecords["unit14"].unit_id,
            target_value: 60,
            main_indicator_id: mainIndicatorRecords["main7"].indicator_id, // นักศึกษาต่างชาติ
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main7
        },
        {
            name: "นักศึกษาต่างชาติระดับปริญญาโท",
            unit_id: unitRecords["unit14"].unit_id,
            target_value: 70,
            main_indicator_id: mainIndicatorRecords["main7"].indicator_id, // นักศึกษาต่างชาติ
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 2, // Second sub-indicator under main7
        },
        {
            name: "นักศึกษาต่างชาติระดับปริญญาเอก",
            unit_id: unitRecords["unit14"].unit_id,
            target_value: 20,
            main_indicator_id: mainIndicatorRecords["main7"].indicator_id, // นักศึกษาต่างชาติ
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 3, // Third sub-indicator under main7
        },
        {
            name: "โครงการวิจัยร่วมกับบริษัทเอกชน",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 15,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id, // โครงการวิจัยร่วมกับภาคอุตสาหกรรม
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main8 (industry research)
        },
        {
            name: "โครงการวิจัยร่วมกับหน่วยงานรัฐ",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 10,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id, // โครงการวิจัยร่วมกับภาคอุตสาหกรรม
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 2, // Second sub-indicator under main8 (industry research)
        },
        {
            name: "โครงการวิจัยร่วมกับองค์กรระหว่างประเทศ",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 5,
            main_indicator_id: mainIndicatorRecords["main8"].indicator_id, // โครงการวิจัยร่วมกับภาคอุตสาหกรรม
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq1"].frequency_id, // รายเดือน
            status: "Active",
            date: new Date(),
            position: 3, // Third sub-indicator under main8 (industry research)
        },
        {
            name: "สิทธิบัตรด้านเทคโนโลยี",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 12,
            main_indicator_id: mainIndicatorRecords["main10"].indicator_id, // สิทธิบัตร
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 1, // First sub-indicator under main10 (patents)
        },
        {
            name: "สิทธิบัตรด้านการแพทย์",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 5,
            main_indicator_id: mainIndicatorRecords["main10"].indicator_id, // สิทธิบัตร
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 2, // Second sub-indicator under main10 (patents)
        },
        {
            name: "สิทธิบัตรด้านเกษตรกรรม",
            unit_id: unitRecords["unit10"].unit_id,
            target_value: 3,
            main_indicator_id: mainIndicatorRecords["main10"].indicator_id, // สิทธิบัตร
            user_id: userRecords["user1"].user_id,
            category_id: categoryRecords["cat1"].category_id,
            frequency_id: frequencyRecords["freq2"].frequency_id, // รายไตรมาส
            status: "Active",
            date: new Date(),
            position: 3, // Third sub-indicator under main10 (patents)
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
            // Main indicators - All CMUPA indicators (main1-main13) assigned to Bob's job (job3)
            {
                indicator_id: mainIndicatorRecords["main1"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
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
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main5"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main6"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main7"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main8"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main9"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main10"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main11"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main12"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main13"].indicator_id,
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            // Non-CMUPA indicators keep their original assignments
            {
                indicator_id: mainIndicatorRecords["main14"].indicator_id, // HR Efficiency
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
            },
            {
                indicator_id: mainIndicatorRecords["main15"].indicator_id, // Academic Publications
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
            // Sub-indicators - All CMUPA sub-indicators assigned to Bob's job (job3)
            {
                indicator_id: subIndicatorRecords["sub1"].indicator_id, // under main2 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub2"].indicator_id, // under main2 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub3"].indicator_id, // under main2 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub4"].indicator_id, // under main4 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub5"].indicator_id, // under main4 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub6"].indicator_id, // under main4 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub9"].indicator_id, // under main7 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub10"].indicator_id, // under main7 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub11"].indicator_id, // under main7 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub12"].indicator_id, // under main8 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub13"].indicator_id, // under main8 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub14"].indicator_id, // under main8 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub15"].indicator_id, // under main10 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub16"].indicator_id, // under main10 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub17"].indicator_id, // under main10 (CMUPA)
                jobtitle_id: jobTitleRecords["job3"].jobtitle_id,
            },
            // Non-CMUPA sub-indicators keep their original assignments
            {
                indicator_id: subIndicatorRecords["sub7"].indicator_id, // under main14 (HR)
                jobtitle_id: jobTitleRecords["job2"].jobtitle_id,
            },
            {
                indicator_id: subIndicatorRecords["sub8"].indicator_id, // under main15 (Academic)
                jobtitle_id: jobTitleRecords["job6"].jobtitle_id,
            },
        ],
    });

    // --- Seed IndicatorData ---
    const allIndicators = await prisma.indicator.findMany({});
    const allPeriods = await prisma.period.findMany({});

    const indicatorData: any[] = [];

    for (const indicator of allIndicators) {
        // เลือก period ตาม frequency ของ indicator
        const validPeriods = allPeriods.filter(
            (p) => p.frequency_id === indicator.frequency_id
        );

        for (const period of validPeriods) {
            // Generate actual value แบบ realistic รอบๆ target_value
            const target = indicator.target_value ?? 50;
            const variation = target * 0.2; // ±20%
            const actual = target + (Math.random() * variation * 2 - variation);

            indicatorData.push({
                indicator_id: indicator.indicator_id,
                period_id: period.period_id,
                actual_value: parseFloat(actual.toFixed(2)),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
    } // insert indicator data

    await prisma.indicatorData.createMany({
        data: indicatorData,
        skipDuplicates: true,
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
