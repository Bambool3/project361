import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";
import {
  normalizeToBangkokMidnight,
  parseDateInputToBangkok,
  isDateAfter,
  isSameDay,
} from "@/lib/dateUtils";

// Validation schema for frequency data
const frequencySchema = z.object({
  name: z.string().min(1, "Name is required"),
  periods: z
    .array(
      z.object({
        name: z.string().min(1, "Period name is required"),
        startDate: z.union([z.string(), z.date()]).transform((val) => {
          try {
            if (typeof val === "string") {
              return parseDateInputToBangkok(val);
            }
            return normalizeToBangkokMidnight(val);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse start date: ${errorMessage}`);
          }
        }),
        endDate: z.union([z.string(), z.date()]).transform((val) => {
          try {
            if (typeof val === "string") {
              return parseDateInputToBangkok(val);
            }
            return normalizeToBangkokMidnight(val);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse end date: ${errorMessage}`);
          }
        }),
        notification_date: z.union([z.string(), z.date()]).transform((val) => {
          try {
            if (typeof val === "string") {
              return parseDateInputToBangkok(val);
            }
            return normalizeToBangkokMidnight(val);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            throw new Error(
              `Failed to parse notification date: ${errorMessage}`
            );
          }
        }),
      })
    )
    .min(1, "At least one period is required"),
});

export async function GET() {
  try {
    const frequencies = await db.frequency.findMany({
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
      orderBy: {
        name: "asc",
      },
    });

    const transformedFrequencies = frequencies.map((frequency) => ({
      frequency_id: frequency.frequency_id,
      name: frequency.name,
      periods: frequency.periods.map((period) => ({
        period_id: period.period_id,
        name: period.name,
        start_date: period.start_date.toISOString(),
        end_date: period.end_date.toISOString(),
        notification_date:
          period.notification_date?.toISOString() ||
          period.end_date.toISOString(),
        frequency_id: period.frequency_id,
      })),
      indicatorCount: frequency._count.indicators,
    }));

    return NextResponse.json(transformedFrequencies);
  } catch (error) {
    console.error("Error fetching frequencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch frequencies" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
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

    // Check if frequency name already exists
    const existingFrequency = await db.frequency.findFirst({
      where: { name: name.trim() },
    });

    if (existingFrequency) {
      return NextResponse.json(
        { error: "Frequency name already exists" },
        { status: 409 }
      );
    }

    // Validate periods
    for (const period of periods) {
      if (
        !period.startDate ||
        !period.endDate ||
        !period.notification_date ||
        isNaN(period.startDate.getTime()) ||
        isNaN(period.endDate.getTime()) ||
        isNaN(period.notification_date.getTime())
      ) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }

      if (
        isSameDay(period.startDate, period.endDate) ||
        !isDateAfter(period.endDate, period.startDate)
      ) {
        return NextResponse.json(
          {
            error:
              "End date must be after start date and cannot be the same day",
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

    // Create the frequency with periods in a transaction
    const newFrequency = await db.$transaction(async (tx) => {
      // Create the frequency
      const frequency = await tx.frequency.create({
        data: {
          name: name.trim(),
        },
      });

      // Create the periods
      await tx.period.createMany({
        data: periods.map((period) => ({
          frequency_id: frequency.frequency_id,
          name: period.name,
          start_date: period.startDate,
          end_date: period.endDate,
          notification_date: period.notification_date,
        })),
      });

      // Return the frequency with periods
      return await tx.frequency.findUnique({
        where: { frequency_id: frequency.frequency_id },
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

    if (!newFrequency) {
      throw new Error("Failed to create frequency");
    }

    const transformedFrequency = {
      frequency_id: newFrequency.frequency_id,
      name: newFrequency.name,
      periods: newFrequency.periods.map((period) => ({
        period_id: period.period_id,
        name: period.name,
        start_date: period.start_date.toISOString(),
        end_date: period.end_date.toISOString(),
        notification_date: period.notification_date.toISOString(),
        frequency_id: period.frequency_id,
      })),
      indicatorCount: newFrequency._count.indicators,
    };

    return NextResponse.json(transformedFrequency, { status: 201 });
  } catch (error) {
    console.error("Error creating frequency:", error);
    return NextResponse.json(
      { error: "Failed to create frequency" },
      { status: 500 }
    );
  }
}
