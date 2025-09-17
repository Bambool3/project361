import { IndicatorFormData, Indicator } from "@/types/management";

export class IndicatorService {
  private static baseUrl = "/api/category-indicators";

  static async createIndicatorWithStatus(
    data: IndicatorFormData
  ): Promise<number> {
    console.log("body in indicater-client-service", data);
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

  static async updateIndicatorWithStatus(
    id: string,
    data: IndicatorFormData
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
      console.error("Error updating indicator:", error);
      return 500;
    }
  }

  //ไม่ได้ทำ delete ไว้
}
