import prisma from "@/lib/db";
import { Category } from "@/types/dashboard";

export async function getCategory(): Promise<Category[]> {
    const category = await prisma.category.findMany({
        include: {
            indicators: true,
        },
    });
    return category;
}
