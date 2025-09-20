import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const categories = await prisma.category.findMany({
            where: {
                indicators: {
                    some: {
                        responsible_jobtitle: {
                            some: {
                                jobtitle: {
                                    user_jobtitle: {
                                        some: {
                                            user_id: userId,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            select: {
                category_id: true,
                name: true,
                description: true,
            },
            orderBy: {
                name: "asc",
            },
        });

        const transformedCategories = categories.map((category: any) => ({
            id: category.category_id,
            name: category.name,
            description: category.description,
        }));

        return NextResponse.json(transformedCategories);
    } catch (error) {
        console.error("Error fetching user categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
