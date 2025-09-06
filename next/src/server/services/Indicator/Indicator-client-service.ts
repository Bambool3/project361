import { Indicator } from "@/types/management";

export class IndicatorService {
  private static baseUrl = "/api/management";
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    const response = await fetch(`${this.baseUrl}/${catId}/kpi`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch kpis");
    return await response.json();
  }
}
