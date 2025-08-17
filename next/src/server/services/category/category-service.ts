import prisma from "@/lib/db";

export async function getCategory() {
    const category = await prisma.category.findMany({
        include: {
            indicators: true,
        },
    });
    return category;
}
