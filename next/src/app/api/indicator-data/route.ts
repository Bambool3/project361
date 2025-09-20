import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { indicatorId, periodId, actualValue } = body;

        if (
            !indicatorId ||
            !periodId ||
            actualValue === undefined ||
            actualValue === null
        ) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ครบถ้วน" },
                { status: 400 }
            );
        }

        const indicator = await db.indicator.findFirst({
            where: {
                indicator_id: indicatorId,
                responsible_jobtitle: {
                    some: {
                        jobtitle: {
                            user_jobtitle: {
                                some: {
                                    user_id: session.user.id,
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!indicator) {
            return NextResponse.json(
                { error: "ไม่พบตัวชี้วัดหรือคุณไม่มีสิทธิ์เข้าถึง" },
                { status: 403 }
            );
        }

        // Validate that the period exists
        const period = await db.period.findUnique({
            where: { period_id: periodId },
        });

        if (!period) {
            return NextResponse.json(
                { error: "ไม่พบรอบการรายงาน" },
                { status: 404 }
            );
        }

        // Upsert indicator data
        const indicatorData = await db.indicatorData.upsert({
            where: {
                indicator_id_period_id: {
                    indicator_id: indicatorId,
                    period_id: periodId,
                },
            },
            update: {
                actual_value: parseFloat(actualValue),
                updated_at: new Date(),
            },
            create: {
                indicator_id: indicatorId,
                period_id: periodId,
                actual_value: parseFloat(actualValue),
            },
        });

        return NextResponse.json({
            success: true,
            data: indicatorData,
        });
    } catch (error) {
        console.error("Error saving indicator data:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const indicatorId = searchParams.get("indicatorId");
        const periodId = searchParams.get("periodId");

        if (!indicatorId) {
            return NextResponse.json(
                { error: "ต้องระบุ indicatorId" },
                { status: 400 }
            );
        }

        const whereClause: any = { indicator_id: indicatorId };
        if (periodId) {
            whereClause.period_id = periodId;
        }

        const indicatorData = await db.indicatorData.findMany({
            where: whereClause,
            include: {
                period: true,
                indicator: {
                    include: {
                        unit: true,
                    },
                },
            },
        });

        return NextResponse.json(indicatorData);
    } catch (error) {
        console.error("Error fetching indicator data:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
            { status: 500 }
        );
    }
}
