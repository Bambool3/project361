import prisma from "@/lib/db";
import { Indicator, IndicatorPayload } from "@/types/management";

export class IndicatorServerService {
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    try {
      // ดึง main indicator
      const indicators = await prisma.indicator.findMany({
        where: { category_id: catId },
        orderBy: [{ main_indicator_id: "asc" }, { position: "asc" }],
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
            position: sub.position,
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
        where: { indicator_id: indicatorId },
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

  static async existsIndicatorByName(
    name: string
  ): Promise<{ id: string } | null> {
    try {
      const indicator = await prisma.indicator.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
        },
        select: {
          indicator_id: true, // ✅ ดึงมาเฉพาะ id
        },
      });

      if (!indicator) {
        return null;
      }

      return { id: indicator.indicator_id.toString() };
    } catch (error) {
      console.error("Error fetching indicator by name from database:", error);
      throw new Error("Failed to fetch indicator by name from database");
    }
  }

  static async createIndicator(
    data: IndicatorPayload,
    userId: string
  ): Promise<Indicator> {
    try {
      // validate input
      if (!data.name?.trim() || !data.target_value?.toString().trim()) {
        throw new Error("Name and target are required");
      }

      // create main indicator
      const newIndicator = await prisma.indicator.create({
        data: {
          name: data.name.trim(),
          target_value: parseFloat(data.target_value),
          unit_id: data.unit_id,
          frequency_id: data.frequency_id,
          category_id: data.category_id,
          user_id: userId.toString(),
          position: 100,
        },
        include: {
          unit: true,
          frequency: true,
          responsible_jobtitle: { include: { jobtitle: true } },
          sub_indicators: true,
        },
      });

      // insert responsible jobtitles
      if (data.jobtitle_ids?.length) {
        await prisma.responsibleJobTitle.createMany({
          data: data.jobtitle_ids.map((jobId) => ({
            indicator_id: newIndicator.indicator_id,
            jobtitle_id: jobId,
          })),
        });
      }

      // insert sub-indicators
      if (data.sub_indicators?.length) {
        await prisma.indicator.createMany({
          data: data.sub_indicators.map((sub, idx) => ({
            name: sub.name.trim(),
            target_value: parseFloat(sub.target_value),
            unit_id: data.unit_id,
            frequency_id: data.frequency_id,
            category_id: data.category_id,
            user_id: userId.toString(),
            position: sub.position ?? idx + 1,
            main_indicator_id: newIndicator.indicator_id,
          })),
        });
      }

      // fetch complete indicator
      const indicator = await prisma.indicator.findUnique({
        where: { indicator_id: newIndicator.indicator_id },
        include: {
          unit: true,
          frequency: true,
          responsible_jobtitle: { include: { jobtitle: true } },
          sub_indicators: true,
        },
      });

      if (!indicator) throw new Error("Indicator not found after creation");

      return {
        id: indicator.indicator_id.toString(),
        name: indicator.name,
        target_value: indicator.target_value,
        unit: {
          unit_id: indicator.unit.unit_id,
          name: indicator.unit.name,
        },
        frequency: {
          frequency_id: indicator.frequency.frequency_id,
          name: indicator.frequency.name,
          periods_in_year: indicator.frequency.periods_in_year,
        },
        main_indicator_id: indicator.main_indicator_id,
        category_id: indicator.category_id,
        responsible_jobtitles:
          indicator.responsible_jobtitle.map((r) => ({
            in_id: r.indicator_id,
            id: r.jobtitle.jobtitle_id,
            name: r.jobtitle.name,
          })) || [],
        sub_indicators:
          indicator.sub_indicators.map((s) => ({
            id: s.indicator_id,
            name: s.name,
            target_value: s.target_value,
            position: s.position,
          })) || [],
      };
    } catch (error) {
      console.error("Error creating indicator in database:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to create indicator in database");
    }
  }
}
