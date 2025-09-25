import { NextResponse } from "next/server";
import db from "@/lib/db";
import { z } from "zod";

// Validation schema for Unit data
const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

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

    // Check if unit exists
    const existingUnit = await db.unit.findUnique({
      where: { unit_id: id },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if name already exists (excluding current unit)
    const duplicateUnit = await db.unit.findFirst({
      where: {
        name: name.trim(),
        NOT: { unit_id: id },
      },
    });

    if (duplicateUnit) {
      return NextResponse.json(
        { error: "Unit name already exists" },
        { status: 409 }
      );
    }

    // Update the unit
    const updatedUnit = await db.unit.update({
      where: { unit_id: id },
      data: { name: name.trim() },
      include: {
        _count: {
          select: {
            indicators: true,
          },
        },
      },
    });

    const transformedUnit = {
      unit_id: updatedUnit.unit_id,
      name: updatedUnit.name,
      indicatorCount: updatedUnit._count.indicators,
    };

    return NextResponse.json(transformedUnit, { status: 200 });
  } catch (error) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: "Failed to update unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if unit exists
    const existingUnit = await db.unit.findUnique({
      where: { unit_id: id },
      include: {
        _count: {
          select: {
            indicators: true,
          },
        },
      },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Check if unit has related indicators (prevent deletion)
    if (existingUnit._count.indicators > 0) {
      return NextResponse.json(
        { error: "Cannot delete unit that has related personnel" },
        { status: 400 }
      );
    }

    // Delete the unit
    await db.unit.delete({
      where: { unit_id: id },
    });

    return NextResponse.json(
      { message: "Unit deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: "Failed to delete unit" },
      { status: 500 }
    );
  }
}
