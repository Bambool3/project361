import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const jobTitles = await prisma.jobTitle.findMany({
            orderBy: {
                name: "asc",
            },
        });

        const jobTitle = jobTitles.map((jobTitle) => ({
            id: jobTitle.jobtitle_id.toString(),
            jobTitle_name: jobTitle.name,
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
