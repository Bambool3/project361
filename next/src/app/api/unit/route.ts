// src/app/api/units/route.ts
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Validation schema for Unit data
const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function GET() {
  try {
    const units = await db.unit.findMany({
      include: {
        _count: {
          select: {
            indicators: true,
          },
        },
      },
      orderBy: {
        unit_id: "desc",
      },
    });

    const transformedUnits = units.map((unit) => ({
      unit_id: unit.unit_id,
      name: unit.name,
      indicatorCount: unit._count.indicators,
    }));

    return NextResponse.json(transformedUnits);
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const validationResult = unitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid data format",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name } = validationResult.data;

    // Check if unit name already exists
    const existingUnit = await db.unit.findFirst({
      where: { name: name.trim() },
    });

    if (existingUnit) {
      return NextResponse.json(
        { error: "Unit name already exists" },
        { status: 409 }
      );
    }

    // Create the new unit
    const newUnit = await db.unit.create({
      data: {
        name: name.trim(),
      },
      include: {
        _count: {
          select: {
            indicators: true,
          },
        },
      },
    });

    const transformedUnit = {
      unit_id: newUnit.unit_id,
      name: newUnit.name,
      indicatorCount: newUnit._count.indicators,
    };

    return NextResponse.json(transformedUnit, { status: 201 });
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
