import { CategoryFormData, Category } from "@/types/dashboard";

export class CategoryService {
  private static baseUrl = "/api/category";

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  static async createCategoryWithStatus(
    data: CategoryFormData
  ): Promise<number> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.status;
    } catch (error) {
      console.error("Error creating category:", error);
      return 500;
    }
  }

  static async updateCategoryWithStatus(
    id: string,
    data: CategoryFormData
  ): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      return response.status;
    } catch (error) {
      console.error("Error updating category:", error);
      return 500;
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }
}
