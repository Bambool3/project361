import prisma from "@/lib/db";
import { Indicator } from "@/types/management";

export class IndicatorServerService {
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    try {
      const indicators = await prisma.indicator.findMany({
        where: { category_id: catId },
        orderBy: [{ name: "asc" }],
      });
      return indicators.map((indicator: any) => ({
        id: indicator.id,
        name: indicator.name,
        unit: indicator.unit,
        target_value: indicator.target_value,
        main_indicator_id: indicator.main_indicator_id,
        responsible_user_id: indicator.responsible_user_id,
        category_id: indicator.category_id,
      }));
    } catch (error) {
      console.error("Error fetching indicators from database:", error);
      throw new Error("Failed to fetch indicators from database");
    }
  }

  // เพิ่ม method อื่นๆ
}
