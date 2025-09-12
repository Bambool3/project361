import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { name } = await request.json();
        const id = parseInt(params.id);

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "Job title name is required" },
                { status: 400 }
            );
        }

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid job title ID" },
                { status: 400 }
            );
        }

        // Check if job title exists
        const existingJobTitle = await prisma.jobTitle.findUnique({
            where: {
                jobtitle_id: id,
            },
        });

        if (!existingJobTitle) {
            return NextResponse.json(
                { error: "Job title not found" },
                { status: 404 }
            );
        }

        // Check if another job title with the same name exists
        const duplicateJobTitle = await prisma.jobTitle.findFirst({
            where: {
                name: name.trim(),
                jobtitle_id: {
                    not: id,
                },
            },
        });

        if (duplicateJobTitle) {
            return NextResponse.json(
                { error: "Job title name already exists" },
                { status: 409 }
            );
        }

        // Update job title
        const updatedJobTitle = await prisma.jobTitle.update({
            where: {
                jobtitle_id: id,
            },
            data: {
                name: name.trim(),
            },
        });

        return NextResponse.json({
            id: updatedJobTitle.jobtitle_id.toString(),
            jobTitle_name: updatedJobTitle.name,
        });
    } catch (error) {
        console.error("Error updating job title:", error);
        return NextResponse.json(
            { error: "Failed to update job title" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json(
                { error: "Invalid job title ID" },
                { status: 400 }
            );
        }

        // Check if job title exists
        const existingJobTitle = await prisma.jobTitle.findUnique({
            where: {
                jobtitle_id: id,
            },
        });

        if (!existingJobTitle) {
            return NextResponse.json(
                { error: "Job title not found" },
                { status: 404 }
            );
        }

        // Check if job title is being used by any employees
        const employeesWithJobTitle = await prisma.userJobTitle.findFirst({
            where: {
                jobtitle_id: id,
            },
        });

        if (employeesWithJobTitle) {
            return NextResponse.json(
                {
                    error: "Cannot delete job title that is assigned to employees",
                },
                { status: 400 }
            );
        }

        // Delete job title
        await prisma.jobTitle.delete({
            where: {
                jobtitle_id: id,
            },
        });

        return NextResponse.json(
            { message: "Job title deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting job title:", error);
        return NextResponse.json(
            { error: "Failed to delete job title" },
            { status: 500 }
        );
    }
}
