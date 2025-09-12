import prisma from "@/lib/db";
import { CategoryFormData, Category } from "@/types/category";

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
                id: category.category_id.toString(),
                name: category.name,
                description: category.description,
                created_at: category.created_at.toISOString(),
                updated_at: category.updated_at?.toISOString(),
                indicators:
                    category.indicators?.map((indicator: any) => ({
                        id: indicator.indicator_id.toString(),
                        name: indicator.name,
                        unit: indicator.unit || "",
                        target_value: indicator.target_value || 0,
                        main_indicator_id:
                            indicator.main_indicator_id?.toString() || "",
                        responsible_user_id: indicator.user_id.toString(),
                        category_id: indicator.category_id.toString(),
                    })) || [],
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
                id: category.category_id.toString(),
                name: category.name,
                description: category.description || "",
                created_at: category.created_at.toISOString(),
                updated_at: category.updated_at?.toISOString(),
                indicators:
                    category.indicators?.map((indicator: any) => ({
                        id: indicator.indicator_id.toString(),
                        name: indicator.name,
                        unit: indicator.unit || "",
                        target_value: indicator.target_value || 0,
                        main_indicator_id:
                            indicator.main_indicator_id?.toString() || "",
                        responsible_user_id: indicator.user_id.toString(),
                        category_id: indicator.category_id.toString(),
                    })) || [],
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
                where: { category_id: parseInt(id) },
                include: {
                    indicators: true,
                },
            });

            if (!category) {
                return null;
            }

            return {
                id: category.category_id.toString(),
                name: category.name,
                description: category.description || "",
                created_at: category.created_at.toISOString(),
                updated_at: category.updated_at?.toISOString(),
                indicators:
                    category.indicators?.map((indicator: any) => ({
                        id: indicator.indicator_id.toString(),
                        name: indicator.name,
                        unit: indicator.unit || "",
                        target_value: indicator.target_value || 0,
                        main_indicator_id:
                            indicator.main_indicator_id?.toString() || "",
                        responsible_user_id: indicator.user_id.toString(),
                        category_id: indicator.category_id.toString(),
                    })) || [],
            };
        } catch (error) {
            console.error(
                "Error fetching category by id from database:",
                error
            );
            throw new Error("Failed to fetch category by id from database");
        }
    }

    static async createCategory(
        data: CategoryFormData,
        userId: number
    ): Promise<Category> {
        try {
            // Validate input
            if (!data.name?.trim() || !data.description?.trim()) {
                throw new Error("Name and description are required");
            }

            const newCategory = await prisma.category.create({
                data: {
                    name: data.name.trim(),
                    description: data.description.trim(),
                    user_id: userId,
                },
                include: {
                    indicators: true,
                },
            });

            return {
                id: newCategory.category_id.toString(),
                name: newCategory.name,
                description: newCategory.description || "",
                created_at: newCategory.created_at.toISOString(),
                updated_at: newCategory.updated_at?.toISOString(),
                indicators: [],
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
                where: { category_id: parseInt(id) },
                data: {
                    name: data.name.trim(),
                    description: data.description.trim(),
                },
                include: {
                    indicators: true,
                },
            });

            return {
                id: updatedCategory.category_id.toString(),
                name: updatedCategory.name,
                description: updatedCategory.description || "",
                created_at: updatedCategory.created_at.toISOString(),
                updated_at: updatedCategory.updated_at?.toISOString(),
                indicators:
                    updatedCategory.indicators?.map((indicator: any) => ({
                        id: indicator.indicator_id.toString(),
                        name: indicator.name,
                        unit: indicator.unit || "",
                        target_value: indicator.target_value || 0,
                        main_indicator_id:
                            indicator.main_indicator_id?.toString() || "",
                        responsible_user_id: indicator.user_id.toString(),
                        category_id: indicator.category_id.toString(),
                    })) || [],
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
                where: { category_id: parseInt(id) },
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
