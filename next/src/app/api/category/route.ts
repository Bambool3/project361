import { NextResponse } from "next/server";
import { getCategory } from "@/server/services/category/category-service";

export async function GET() {
    try {
        const categories = await getCategory();
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
        const body = await request.json();

        // Implement your create category logic here
        // const newCategory = await createCategory(body);

        return NextResponse.json({ message: "Category created successfully" });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            { error: "Failed to create category" },
            { status: 500 }
        );
    }
}
