import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            orderBy: {
                name: "asc",
            },
        });

        const transformedRoles = roles.map((role) => ({
            id: role.role_id.toString(),
            role_name: role.name,
        }));

        return NextResponse.json(transformedRoles);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json(
            { error: "Failed to fetch roles" },
            { status: 500 }
        );
    }
}
