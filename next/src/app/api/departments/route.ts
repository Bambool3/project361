import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const departments = await prisma.department.findMany({
            orderBy: {
                department_name: "asc",
            },
        });

        return NextResponse.json(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json(
            { error: "Failed to fetch departments" },
            { status: 500 }
        );
    }
}
