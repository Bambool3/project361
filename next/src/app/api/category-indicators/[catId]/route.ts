// src/app/api/category-indicators/[catId]

import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ catId: string }> }
) {
    try {
        const { catId } = await context.params;
        const kpis = await IndicatorServerService.getIndicatorsByCategory(
            catId
        );
        return NextResponse.json(kpis);
    } catch (error) {
        return NextResponse.json(
            { error: "Error fetching KPIs" },
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
        const deletionResult = await IndicatorServerService.deleteIndicator(
            catId
        );

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

        return NextResponse.json(
            { message: "ลบตัวชี้วัดสำเร็จ" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting indicator:", error);

        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดภายในระบบ" },
            { status: 500 }
        );
    }
}
