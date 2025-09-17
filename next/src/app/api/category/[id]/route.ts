import { NextResponse } from "next/server";
import { CategoryServerService } from "@/server/services/category/category-server-service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { error: "ชื่อหมวดหมู่และรายละเอียดจำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await CategoryServerService.getCategoryById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "ไม่พบหมวดหมู่ที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    // Check if category name already exists (+ current category)
    const duplicateCategory = await CategoryServerService.getCategoryByName(
      body.name
    );
    if (duplicateCategory && duplicateCategory.id !== id) {
      return NextResponse.json(
        { error: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const updatedCategory = await CategoryServerService.updateCategory(
      id,
      body
    );

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);

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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await CategoryServerService.getCategoryById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "ไม่พบหมวดหมู่ที่ต้องการลบ" },
        { status: 404 }
      );
    }

    // Check if category has indicators
    if (existingCategory.indicators && existingCategory.indicators.length > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบหมวดหมู่ที่มี KPIs อยู่ได้" },
        { status: 400 }
      );
    }

    await CategoryServerService.deleteCategory(id);

    return NextResponse.json({ message: "ลบหมวดหมู่สำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
