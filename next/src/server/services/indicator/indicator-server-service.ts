import prisma from "@/lib/db";
import { Indicator } from "@/types/management";

export class IndicatorServerService {
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    try {
      // ดึง main indicator
      const indicators = await prisma.indicator.findMany({
        where: { category_id: catId },
        orderBy: [{ name: "asc" }],
      });
      // กรอง main indicator (main_indicator_id เท่ากับ id ตัวเอง) ต้อง seed main indicator เป็น null ค่อยลบ
      const mainIndicators = indicators.filter(
        (indicator: any) => indicator.main_indicator_id === indicator.id
      );
      // ดึง subindicator ใช้วิธ๊ filter ไปก่อน
      const subIndicators = indicators.filter(
        (indicator: any) => indicator.main_indicator_id !== indicator.id
      );

      return mainIndicators.map((indicator: any) => ({
        id: indicator.id,
        name: indicator.name,
        unit: indicator.unit,
        target_value: indicator.target_value,
        main_indicator_id: indicator.main_indicator_id,
        responsible_user_id: indicator.responsible_user_id,
        category_id: indicator.category_id,
        sub_indicators: subIndicators
          .filter((sub) => sub.main_indicator_id === indicator.id)
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            target_value: sub.target_value,
          })),
      }));
    } catch (error) {
      console.error("Error fetching indicators from database:", error);
      throw new Error("Failed to fetch indicators from database");
    }
  }

  // เพิ่ม method อื่นๆ
}
