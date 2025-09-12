import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import {
    normalizeToBangkokMidnight,
    parseDateInputToBangkok,
    isDateAfter,
    isSameDay,
} from "@/lib/dateUtils";

// Validation schema
const frequencySchema = z.object({
    name: z.string().min(1, "Name is required"),
    periods: z
        .array(
            z.object({
                startDate: z.union([z.string(), z.date()]).transform((val) => {
                    if (typeof val === "string") {
                        return parseDateInputToBangkok(val);
                    }
                    return normalizeToBangkokMidnight(val);
                }),
                endDate: z.union([z.string(), z.date()]).transform((val) => {
                    if (typeof val === "string") {
                        return parseDateInputToBangkok(val);
                    }
                    return normalizeToBangkokMidnight(val);
                }),
            })
        )
        .min(1, "At least one period is required"),
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const frequency_id = parseInt(params.id);

        if (isNaN(frequency_id)) {
            return NextResponse.json(
                { error: "Invalid frequency ID" },
                { status: 400 }
            );
        }

        const frequency = await db.frequency.findUnique({
            where: { frequency_id },
            include: {
                periods: {
                    orderBy: {
                        start_date: "asc",
                    },
                },
                _count: {
                    select: {
                        indicators: true,
                    },
                },
            },
        });

        if (!frequency) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

        const transformedFrequency = {
            frequency_id: frequency.frequency_id,
            name: frequency.name,
            periods: frequency.periods.map((period) => ({
                period_id: period.period_id,
                start_date: period.start_date.toISOString(),
                end_date: period.end_date.toISOString(),
                frequency_id: period.frequency_id,
            })),
            indicatorCount: frequency._count.indicators,
        };

        return NextResponse.json(transformedFrequency);
    } catch (error) {
        console.error("Error fetching frequency:", error);
        return NextResponse.json(
            { error: "Failed to fetch frequency" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const frequency_id = parseInt(params.id);

        if (isNaN(frequency_id)) {
            return NextResponse.json(
                { error: "Invalid frequency ID" },
                { status: 400 }
            );
        }

        const body = await request.json();

        // Check if frequency exists
        const existingFrequency = await db.frequency.findUnique({
            where: { frequency_id },
            include: {
                periods: true,
                _count: {
                    select: {
                        indicators: true,
                    },
                },
            },
        });

        if (!existingFrequency) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

        const validationResult = frequencySchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid data format",
                    details: validationResult.error.issues,
                },
                { status: 400 }
            );
        }

        const { name, periods } = validationResult.data;

        const duplicateFrequency = await db.frequency.findFirst({
            where: {
                name: name.trim(),
                frequency_id: {
                    not: frequency_id,
                },
            },
        });

        if (duplicateFrequency) {
            return NextResponse.json(
                { error: "Frequency name already exists" },
                { status: 409 }
            );
        }

        // Validate periods
        for (const period of periods) {
            if (
                isSameDay(period.startDate, period.endDate) ||
                !isDateAfter(period.endDate, period.startDate)
            ) {
                return NextResponse.json(
                    {
                        error: "End date must be after start date and cannot be the same day",
                    },
                    { status: 400 }
                );
            }
        }

        // Check for overlapping periods
        const sortedPeriods = [...periods].sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime()
        );

        for (let i = 0; i < sortedPeriods.length - 1; i++) {
            const current = sortedPeriods[i];
            const next = sortedPeriods[i + 1];

            // Periods overlap if current end date >= next start date
            if (current.endDate.getTime() >= next.startDate.getTime()) {
                return NextResponse.json(
                    { error: "Periods cannot overlap" },
                    { status: 400 }
                );
            }
        }

        // Update the frequency with periods
        const updatedFrequency = await db.$transaction(async (tx) => {
            // Update the frequency name
            await tx.frequency.update({
                where: { frequency_id },
                data: {
                    name: name.trim(),
                },
            });

            // Delete existing periods
            await tx.period.deleteMany({
                where: { frequency_id },
            });

            // Create new periods
            await tx.period.createMany({
                data: periods.map((period) => ({
                    frequency_id,
                    start_date: period.startDate,
                    end_date: period.endDate,
                })),
            });

            // Return the updated frequency with periods
            return await tx.frequency.findUnique({
                where: { frequency_id },
                include: {
                    periods: {
                        orderBy: {
                            start_date: "asc",
                        },
                    },
                    _count: {
                        select: {
                            indicators: true,
                        },
                    },
                },
            });
        });

        if (!updatedFrequency) {
            throw new Error("Failed to update frequency");
        }

        const transformedFrequency = {
            frequency_id: updatedFrequency.frequency_id,
            name: updatedFrequency.name,
            periods: updatedFrequency.periods.map((period) => ({
                period_id: period.period_id,
                start_date: period.start_date.toISOString(),
                end_date: period.end_date.toISOString(),
                frequency_id: period.frequency_id,
            })),
            indicatorCount: updatedFrequency._count.indicators,
        };

        return NextResponse.json(transformedFrequency);
    } catch (error) {
        console.error("Error updating frequency:", error);
        return NextResponse.json(
            { error: "Failed to update frequency" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const frequency_id = parseInt(params.id);

        if (isNaN(frequency_id)) {
            return NextResponse.json(
                { error: "Invalid frequency ID" },
                { status: 400 }
            );
        }

        // Check if frequency exists and get indicator count
        const frequency = await db.frequency.findUnique({
            where: { frequency_id },
            include: {
                _count: {
                    select: {
                        indicators: true,
                    },
                },
            },
        });

        if (!frequency) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

        // Check if frequency has associated indicators
        if (frequency._count.indicators > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete frequency that has associated indicators. Please remove all indicators using this frequency first.",
                },
                { status: 400 }
            );
        }

        // Delete the frequency and its periods in a transaction
        await db.$transaction(async (tx) => {
            // Delete all periods first
            await tx.period.deleteMany({
                where: { frequency_id },
            });

            // Then delete the frequency
            await tx.frequency.delete({
                where: { frequency_id },
            });
        });

        return NextResponse.json({ message: "Frequency deleted successfully" });
    } catch (error) {
        console.error("Error deleting frequency:", error);
        return NextResponse.json(
            { error: "Failed to delete frequency" },
            { status: 500 }
        );
    }
}
