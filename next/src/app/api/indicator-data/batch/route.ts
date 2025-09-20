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
        const { entries } = body;

        if (!Array.isArray(entries) || entries.length === 0) {
            return NextResponse.json(
                { error: "ข้อมูลไม่ครบถ้วน" },
                { status: 400 }
            );
        }

        const validatedEntries: Array<{
            indicatorId: string;
            periodId: string;
            actualValue: number;
        }> = [];
        for (const entry of entries) {
            const { indicatorId, periodId, actualValue } = entry;

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
                    {
                        error: `ไม่พบตัวชี้วัด ${indicatorId} หรือคุณไม่มีสิทธิ์เข้าถึง`,
                    },
                    { status: 403 }
                );
            }

            validatedEntries.push({
                indicatorId,
                periodId,
                actualValue: parseFloat(actualValue),
            });
        }

        const results = await db.$transaction(async (prisma) => {
            const savedEntries = [];

            for (const entry of validatedEntries) {
                const indicatorData = await prisma.indicatorData.upsert({
                    where: {
                        indicator_id_period_id: {
                            indicator_id: entry.indicatorId,
                            period_id: entry.periodId,
                        },
                    },
                    update: {
                        actual_value: entry.actualValue,
                        updated_at: new Date(),
                    },
                    create: {
                        indicator_id: entry.indicatorId,
                        period_id: entry.periodId,
                        actual_value: entry.actualValue,
                    },
                });

                savedEntries.push(indicatorData);
            }

            return savedEntries;
        });

        return NextResponse.json({
            success: true,
            count: results.length,
            data: results,
        });
    } catch (error) {
        console.error("Error batch saving indicator data:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
            { status: 500 }
        );
    }
}
