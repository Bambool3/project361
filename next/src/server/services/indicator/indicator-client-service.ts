import { IndicatorFormData, Indicator } from "@/types/management";

export class IndicatorService {
  private static baseUrlCategory = "/api/category-indicators";

  static async createIndicatorWithStatus(
    data: IndicatorFormData
  ): Promise<number> {
    console.log("body in indicater-client-service", data);
    try {
      const response = await fetch(this.baseUrlCategory, {
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

  static async updateIndicatorWithStatus(
    categoryId: string,
    indicatorId: string,
    data: IndicatorFormData
  ): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrlCategory}/${categoryId}/${indicatorId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return response.status;
    } catch (error) {
      console.error("Error updating indicator:", error);
      return 500;
    }
  }

  static async deleteIndicatorWithStatus(
    categoryId: string,
    indicatorId: string
  ): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrlCategory}/${categoryId}/${indicatorId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.status;
    } catch (error) {
      console.error("Error deleting indicator:", error);
      return 500;
    }
  }
}
