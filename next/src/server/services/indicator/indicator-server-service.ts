import prisma from "@/lib/db";
import { Indicator } from "@/types/management";

export class IndicatorServerService {
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    try {
      // ดึง main indicator
      const indicators = await prisma.indicator.findMany({
        where: { category_id: parseInt(catId) },
        orderBy: [{ name: "asc" }],
        include: {
          responsible_jobtitle: {
            include: {
              jobtitle: true, // ดึง id และ name ของ jobtitle
            },
          },
          frequency: true,
          unit: true,
        },
      });
      console.log("indicators=", indicators);
      // กรอง main indicator
      const mainIndicators = indicators.filter(
        (indicator) => indicator.main_indicator_id === null
      );
      // ดึง subindicator
      const subIndicators = indicators.filter(
        (indicator: any) => indicator.main_indicator_id !== null
      );

      return mainIndicators.map((indicator: any) => ({
        id: indicator.indicator_id.toString(),
        name: indicator.name,
        unit: { unit_id: indicator.unit.unit_id, name: indicator.unit.name },
        target_value: indicator.target_value,
        main_indicator_id: indicator.main_indicator_id,
        responsible_jobtitles: indicator.responsible_jobtitle.map((r) => ({
          in_id: r.indicator_id,
          id: r.jobtitle.jobtitle_id,
          name: r.jobtitle.name,
        })),
        category_id: indicator.category_id,
        frequency: {
          frequency_id: indicator.frequency.frequency_id,
          name: indicator.frequency.name,
          periods_in_year: indicator.frequency.periods_in_year,
        }, // ✅ ดึงข้อมูลความถี่
        sub_indicators: subIndicators
          .filter((sub) => sub.main_indicator_id === indicator.indicator_id)
          .map((sub) => ({
            id: sub.indicator_id,
            name: sub.name,
            target_value: sub.target_value,
          })),
      }));
    } catch (error) {
      console.error("Error fetching indicators from database:", error);
      throw new Error("Failed to fetch indicators from database");
    }
  }

  static async deleteIndicator(indicatorId: string) {
    try {
      const deletedIndicator = await prisma.indicator.delete({
        where: { indicator_id: parseInt(indicatorId) },
      });
      return {
        success: true,
        data: deletedIndicator,
      };
    } catch (error: any) {
      console.error("❌ Error deleting indicator:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
