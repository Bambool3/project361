import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const jobTitles = await prisma.jobTitle.findMany({
            include: {
                user_jobtitle: {
                    select: {
                        user_id: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const jobTitle = jobTitles.map((jobTitle) => ({
            id: jobTitle.jobtitle_id,
            jobTitle_name: jobTitle.name,
            employeeCount: jobTitle.user_jobtitle.length,
        }));

        return NextResponse.json(jobTitle);
    } catch (error) {
        console.error("Error fetching job titles:", error);
        return NextResponse.json(
            { error: "Failed to fetch job titles" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Job title name is required" },
                { status: 400 }
            );
        }

        // Check if job title already exists
        const existingJobTitle = await prisma.jobTitle.findFirst({
            where: {
                name: name.trim(),
            },
        });

        if (existingJobTitle) {
            return NextResponse.json(
                { error: "Job title already exists" },
                { status: 409 }
            );
        }

        const newJobTitle = await prisma.jobTitle.create({
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json(
            {
                id: newJobTitle.jobtitle_id,
                jobTitle_name: newJobTitle.name,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating job title:", error);
        return NextResponse.json(
            { error: "Failed to create job title" },
            { status: 500 }
        );
    }
}
