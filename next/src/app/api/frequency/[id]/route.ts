import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for frequency data
const frequencySchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["standard", "custom"]),
    periods: z
        .array(
            z.object({
                startDate: z.string().transform((str) => new Date(str)),
                endDate: z.string().transform((str) => new Date(str)),
            })
        )
        .min(1, "At least one period is required"),
});

// Mock data - same as in the main route
let frequencies: any[] = [
    {
        id: "1",
        name: "รายปี",
        type: "standard",
        periods: [
            {
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-12-31"),
            },
        ],
        indicatorCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "2",
        name: "รายเดือน",
        type: "standard",
        periods: Array.from({ length: 12 }, (_, i) => {
            const year = 2024;
            const month = i + 1;
            const startDate = new Date(year, i, 1);
            const endDate = new Date(year, i + 1, 0); // Last day of the month
            return { startDate, endDate };
        }),
        indicatorCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "3",
        name: "รายไตรมาส",
        type: "custom",
        periods: [
            {
                startDate: new Date("2024-01-01"),
                endDate: new Date("2024-03-31"),
            },
            {
                startDate: new Date("2024-04-01"),
                endDate: new Date("2024-06-30"),
            },
            {
                startDate: new Date("2024-07-01"),
                endDate: new Date("2024-09-30"),
            },
            {
                startDate: new Date("2024-10-01"),
                endDate: new Date("2024-12-31"),
            },
        ],
        indicatorCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const frequency = frequencies.find((f) => f.id === params.id);

        if (!frequency) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(frequency);
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
        const body = await request.json();

        // Find the frequency to update
        const frequencyIndex = frequencies.findIndex((f) => f.id === params.id);

        if (frequencyIndex === -1) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

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

        const { name, type, periods } = validationResult.data;

        // Check if frequency name already exists (excluding current frequency)
        const existingFrequency = frequencies.find(
            (f) =>
                f.id !== params.id &&
                f.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (existingFrequency) {
            return NextResponse.json(
                { error: "Frequency name already exists" },
                { status: 409 }
            );
        }

        // Validate periods
        for (const period of periods) {
            if (period.endDate <= period.startDate) {
                return NextResponse.json(
                    { error: "End date must be after start date" },
                    { status: 400 }
                );
            }
        }

        // Check for overlapping periods
        const sortedPeriods = [...periods].sort(
            (a, b) =>
                new Date(a.startDate).getTime() -
                new Date(b.startDate).getTime()
        );

        for (let i = 0; i < sortedPeriods.length - 1; i++) {
            const current = sortedPeriods[i];
            const next = sortedPeriods[i + 1];

            if (current.endDate >= next.startDate) {
                return NextResponse.json(
                    { error: "Periods cannot overlap" },
                    { status: 400 }
                );
            }
        }

        // Update the frequency
        const currentFrequency = frequencies[frequencyIndex];
        const updatedFrequency = {
            ...currentFrequency,
            name: name.trim(),
            type,
            periods,
            updatedAt: new Date(),
        };

        frequencies[frequencyIndex] = updatedFrequency;

        return NextResponse.json(updatedFrequency);
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
        const frequencyIndex = frequencies.findIndex((f) => f.id === params.id);

        if (frequencyIndex === -1) {
            return NextResponse.json(
                { error: "Frequency not found" },
                { status: 404 }
            );
        }

        const frequency = frequencies[frequencyIndex];

        // Check if frequency has associated indicators
        if (frequency.indicatorCount > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete frequency that has associated indicators. Please remove all indicators using this frequency first.",
                },
                { status: 400 }
            );
        }

        // Remove the frequency
        frequencies.splice(frequencyIndex, 1);

        return NextResponse.json({ message: "Frequency deleted successfully" });
    } catch (error) {
        console.error("Error deleting frequency:", error);
        return NextResponse.json(
            { error: "Failed to delete frequency" },
            { status: 500 }
        );
    }
}
