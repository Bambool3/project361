// src/app/api/category-indicators
import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// เพิ่ม indicator ใหม่
export async function POST(request: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    const body = await request.json();
    console.log("body=", body);
    // Validate required fields
    if (!body.target_value?.toString().trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกเป้าหมายให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const existingIndicator =
      await IndicatorServerService.existsIndicatorByName(body.name);

    if (existingIndicator) {
      return NextResponse.json(
        { error: "ชื่อตัวชี้วัดนี้มีอยู่ในระบบแล้ว" },
        { status: 409 }
      );
    }
    console.log("session.user.id:", session.user.id);
    const newIndicator = await IndicatorServerService.createIndicator(
      body,
      session.user.id
    );

    return NextResponse.json(newIndicator, { status: 201 });
  } catch (error) {
    console.error("Error creating indicator:", error);

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
