import prisma from "@/lib/db";
import { CategoryFormData, Category } from "@/types/dashboard";

export class CategoryServerService {
    static async getCategories(): Promise<Category[]> {
        try {
            const categories = await prisma.category.findMany({
                include: {
                    indicators: true,
                },
                orderBy: [
                    {
                        name: "asc",
                    },
                ],
            });

            return categories.map((category: any) => ({
                id: category.id,
                name: category.name,
                description: category.description,
                indicators: category.indicators || [],
            }));
        } catch (error) {
            console.error("Error fetching categories from database:", error);
            throw new Error("Failed to fetch categories from database");
        }
    }

    static async getCategoryByName(name: string): Promise<Category | null> {
        try {
            const category = await prisma.category.findFirst({
                where: {
                    name: {
                        equals: name.trim(),
                        mode: "insensitive",
                    },
                },
                include: {
                    indicators: true,
                },
            });

            if (!category) {
                return null;
            }

            return {
                id: category.id,
                name: category.name,
                description: category.description,
                indicators: category.indicators || [],
            };
        } catch (error) {
            console.error(
                "Error fetching category by name from database:",
                error
            );
            throw new Error("Failed to fetch category by name from database");
        }
    }

    static async getCategoryById(id: string): Promise<Category | null> {
        try {
            const category = await prisma.category.findUnique({
                where: { id },
                include: {
                    indicators: true,
                },
            });

            if (!category) {
                return null;
            }

            return {
                id: category.id,
                name: category.name,
                description: category.description,
                indicators: category.indicators || [],
            };
        } catch (error) {
            console.error(
                "Error fetching category by id from database:",
                error
            );
            throw new Error("Failed to fetch category by id from database");
        }
    }

    static async createCategory(data: CategoryFormData): Promise<Category> {
        try {
            // Validate input
            if (!data.name?.trim() || !data.description?.trim()) {
                throw new Error("Name and description are required");
            }

            const newCategory = await prisma.category.create({
                data: {
                    id: `cat_${Date.now()}_${Math.random()
                        .toString(36)
                        .substr(2, 9)}`,
                    name: data.name.trim(),
                    description: data.description.trim(),
                },
                include: {
                    indicators: true,
                },
            });

            return {
                id: newCategory.id,
                name: newCategory.name,
                description: newCategory.description,
                indicators: newCategory.indicators || [],
            };
        } catch (error) {
            console.error("Error creating category in database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to create category in database");
        }
    }

    static async updateCategory(
        id: string,
        data: CategoryFormData
    ): Promise<Category> {
        try {
            // Validate input
            if (!data.name?.trim() || !data.description?.trim()) {
                throw new Error("Name and description are required");
            }

            const updatedCategory = await prisma.category.update({
                where: { id },
                data: {
                    name: data.name.trim(),
                    description: data.description.trim(),
                },
                include: {
                    indicators: true,
                },
            });

            return {
                id: updatedCategory.id,
                name: updatedCategory.name,
                description: updatedCategory.description,
                indicators: updatedCategory.indicators || [],
            };
        } catch (error) {
            console.error("Error updating category in database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to update category in database");
        }
    }

    static async deleteCategory(id: string): Promise<void> {
        try {
            await prisma.category.delete({
                where: { id },
            });
        } catch (error) {
            console.error("Error deleting category from database:", error);
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to delete category from database");
        }
    }
}
