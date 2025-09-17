import { NextResponse } from "next/server";
import { CategoryServerService } from "@/server/services/category/category-server-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const categories = await CategoryServerService.getCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Verify user is authenticated
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        if (!body.name?.trim() || !body.description?.trim()) {
            return NextResponse.json(
                { error: "ชื่อหมวดหมู่และรายละเอียดจำเป็นต้องกรอก" },
                { status: 400 }
            );
        }

        // Check if category name already exists
        const existingCategory = await CategoryServerService.getCategoryByName(
            body.name
        );
        if (existingCategory) {
            return NextResponse.json(
                { error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" },
                { status: 409 }
            );
        }

        const newCategory = await CategoryServerService.createCategory(
            body,
            session.user.id // Make sure downstream expects string
        );

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);

        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return NextResponse.json(
                    { error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" },
                    { status: 409 }
                );
            }
            if (error.message.includes("required")) {
                return NextResponse.json(
                    { error: "ข้อมูลที่จำเป็นไม่ครบถ้วน" },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในระบบ" },
            { status: 500 }
        );
    }
}
