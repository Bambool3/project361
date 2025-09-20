import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import db from "@/lib/db";

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
        const userId = searchParams.get("userId") || session.user.id;
        const categoryId = searchParams.get("categoryId");

        const indicators = await db.indicator.findMany({
            where: {
                AND: [
                    categoryId ? { category_id: categoryId } : {},
                    {
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
                ],
            },
            include: {
                unit: true,
                frequency: {
                    include: {
                        periods: {
                            orderBy: {
                                start_date: "asc",
                            },
                        },
                    },
                },
                responsible_jobtitle: {
                    include: {
                        jobtitle: true,
                    },
                },
                sub_indicators: {
                    include: {
                        unit: true,
                        indicator_data: {
                            include: {
                                period: true,
                            },
                        },
                    },
                    orderBy: {
                        position: "asc",
                    },
                },
                indicator_data: {
                    include: {
                        period: true,
                    },
                },
            },
            orderBy: {
                position: "asc",
            },
        });

        const periods = await db.period.findMany({
            orderBy: {
                start_date: "asc",
            },
        });

        return NextResponse.json({
            indicators,
            periods,
        });
    } catch (error) {
        console.error("Error fetching user indicators:", error);
        return NextResponse.json(
            { error: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวชี้วัด" },
            { status: 500 }
        );
    }
}
