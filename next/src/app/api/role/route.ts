import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                user_roles: {
                    select: {
                        user_id: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        const transformedRoles = roles.map((role) => ({
            id: role.role_id,
            role_name: role.name,
            employeeCount: role.user_roles.length,
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

export async function POST(request: Request) {
    try {
        const { name } = await request.json();

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Role name is required" },
                { status: 400 }
            );
        }

        // Check if role already exists
        const existingRole = await prisma.role.findFirst({
            where: {
                name: name.trim(),
            },
        });

        if (existingRole) {
            return NextResponse.json(
                { error: "Role already exists" },
                { status: 409 }
            );
        }

        const newRole = await prisma.role.create({
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json(
            {
                id: newRole.role_id,
                role_name: newRole.name,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating role:", error);
        return NextResponse.json(
            { error: "Failed to create role" },
            { status: 500 }
        );
    }
}
