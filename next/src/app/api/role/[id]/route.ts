import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { name } = await request.json();
        const { id } = await params;

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Role name is required" },
                { status: 400 }
            );
        }

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Invalid role ID" },
                { status: 400 }
            );
        }

        // Check if role exists
        const existingRole = await prisma.role.findUnique({
            where: {
                role_id: id,
            },
        });

        if (!existingRole) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Check if another role with the same name exists
        const duplicateRole = await prisma.role.findFirst({
            where: {
                name: name.trim(),
                role_id: {
                    not: id,
                },
            },
        });

        if (duplicateRole) {
            return NextResponse.json(
                { error: "Role name already exists" },
                { status: 409 }
            );
        }

        // Update role
        const updatedRole = await prisma.role.update({
            where: {
                role_id: id,
            },
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json({
            id: updatedRole.role_id,
            jobTitle_name: updatedRole.name,
        });
    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json(
            { error: "Failed to update role" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Invalid role ID" },
                { status: 400 }
            );
        }

        // Check if role exists
        const existingRole = await prisma.role.findUnique({
            where: {
                role_id: id,
            },
        });

        if (!existingRole) {
            return NextResponse.json(
                { error: "Role not found" },
                { status: 404 }
            );
        }

        // Check if role is being used by any employees
        const employeesWithRole = await prisma.userRole.findFirst({
            where: {
                role_id: id,
            },
        });

        if (employeesWithRole) {
            return NextResponse.json(
                {
                    error: "Cannot delete role that is assigned to employees",
                },
                { status: 400 }
            );
        }

        // Delete role
        await prisma.role.delete({
            where: {
                role_id: id,
            },
        });

        return NextResponse.json(
            { message: "Role deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting role:", error);
        return NextResponse.json(
            { error: "Failed to delete role" },
            { status: 500 }
        );
    }
}
