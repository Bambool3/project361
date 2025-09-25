import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ catId: string; indicatorId: string }> }
) {
  try {
    const { catId, indicatorId } = await context.params; // ✅ ต้อง await
    const body = await request.json();
    console.log("categoryId=", catId, "indicatorId=", indicatorId);

    // Validate required fields
    if (!body.name?.trim() || !body.target_value?.toString().trim()) {
      return NextResponse.json(
        { error: "ชื่อตัวชี้วัดและรายละเอียดจำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    // Check duplicate name (ยกเว้น indicator นี้)
    const duplicateIndicator =
      await IndicatorServerService.existsIndicatorByName(body.name);

    if (duplicateIndicator && duplicateIndicator.id !== indicatorId) {
      return NextResponse.json(
        { error: "ชื่อตัวชี้วัดนี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }

    const updatedIndicator = await IndicatorServerService.updateIndicator(
      indicatorId, // ส่ง indicatorId
      body
    );

    return NextResponse.json(updatedIndicator, { status: 200 });
  } catch (error) {
    console.error("Error updating indicator:", error);

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
  { params }: { params: { catId: string; indicatorId: string } }
) {
  try {
    const { catId, indicatorId } = params; // catId = categoryId, indicatorId = id ของ indicator

    const deletionResult = await IndicatorServerService.deleteIndicator(
      indicatorId
    );

    if (!deletionResult.success) {
      if (deletionResult.message?.includes("does not exist")) {
        return NextResponse.json(
          { error: "ไม่พบตัวชี้วัดที่ต้องการลบ" },
          { status: 404 }
        );
      }
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
