// src/app/api/category-indicators/[catId]

import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ catId: string }> }
) {
  try {
    const { catId } = await context.params;
    const kpis = await IndicatorServerService.getIndicatorsByCategory(catId);
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching KPIs" }, { status: 500 });
  }
}

// code ข้างล่างนี้ควรแก้ไข catId หมายถึง IndicatorId
export async function PUT(
  request: Request,
  { params }: { params: { catId: string } }
) {
  try {
    const { catId } = params;
    const body = await request.json();
    console.log("id=", catId);

    // Validate required fields
    if (!body.name?.trim() || !body.target_value?.toString().trim()) {
      return NextResponse.json(
        { error: "ชื่อตัวชี้วัดและรายละเอียดจำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    // Check if Indicator exists
    // const existingIndicator =
    //   await IndicatorServerService.getIndicatorsByCategory(id);
    // if (!existingIndicator) {
    //   return NextResponse.json(
    //     { error: "ไม่พบตัวชี้วัดที่ต้องการแก้ไข" },
    //     { status: 404 }
    //   );
    // }

    // Check if indicator name already exists (+ current indicator)
    const duplicateIndicator =
      await IndicatorServerService.existsIndicatorByName(body.name);

    if (duplicateIndicator && duplicateIndicator.id !== catId) {
      return NextResponse.json(
        { error: "ชื่อตัวชี้วัดนี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const updatedIndicator = await IndicatorServerService.updateIndicator(
      catId,
      body
    );

    return NextResponse.json(updatedIndicator, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "ชื่อตัวชี้วัดนี้มีอยู่ในระบบแล้ว" },
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
  request: NextRequest,
  context: { params: Promise<{ catId: string }> }
) {
  try {
    const { catId } = await context.params;
    // สมมติ indicatorId คือ catId ใน route path กรณีนี้อาจกำหนดชื่อ route ให้ตรงกับ indicatorId จะชัดกว่า
    const deletionResult = await IndicatorServerService.deleteIndicator(catId);

    if (!deletionResult.success) {
      // ถ้า error message บอกว่าไม่พบ record ให้ส่ง 404
      if (deletionResult.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "ไม่พบตัวชี้วัดที่ต้องการลบ" },
          { status: 404 }
        );
      }
      // error อื่น ๆ เป็น 500
      return NextResponse.json(
        { error: "เกิดข้อผิดพลาดในการลบตัวชี้วัด" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "ลบตัวชี้วัดสำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting indicator:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดภายในระบบ" },
      { status: 500 }
    );
  }
}
