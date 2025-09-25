import prisma from "@/lib/db";
import {
  Indicator,
  IndicatorPayload,
  MappedIndicator,
  ReorderPayload,
} from "@/types/management";

export class IndicatorServerService {
  static async getIndicatorsByCategory(catId: string): Promise<Indicator[]> {
    try {
      // ดึง indicator ทั้งหมดพร้อม indicator_data
      const indicators = await prisma.indicator.findMany({
        where: { category_id: catId },
        include: {
          responsible_jobtitle: {
            include: { jobtitle: true },
          },
          frequency: true,
          unit: true,
          indicator_data: {
            orderBy: { period: { start_date: "asc" } },
            include: { period: true },
          },
        },
      });

      // แยก main และ sub indicator
      const mainIndicators = indicators
        .filter((i) => i.main_indicator_id === null)
        .sort((a, b) => a.position - b.position); // เรียง main ตาม position

      const subIndicators = indicators
        .filter((i) => i.main_indicator_id !== null)
        .sort((a, b) => a.position - b.position); // เรียง sub ตาม position

      // map main indicator
      const mappedIndicators = mainIndicators.map((main) => {
        const data = main.indicator_data;
        const TotalActual = data.length
          ? data.reduce(
              (sum, d) => sum + (d.actual_value ?? 0), // ถ้า actual_value เป็น null ให้คิดเป็น 0
              0
            )
          : null;
        const latestActual = data.length
          ? data[data.length - 1].actual_value
          : null;
        const previousActual =
          data.length > 1 ? data[data.length - 2].actual_value : null;
        const trend =
          latestActual === null || previousActual === null
            ? null
            : latestActual > previousActual
            ? "up"
            : latestActual < previousActual
            ? "down"
            : "same";

        // map sub indicators
        const subMapped = subIndicators
          .filter((sub) => sub.main_indicator_id === main.indicator_id)
          .sort((a, b) => a.position - b.position)
          .map((sub) => {
            const subData = sub.indicator_data;
            const subTotalActual = subData.length
              ? subData.reduce(
                  (sum, d) => sum + (d.actual_value ?? 0), // ถ้า actual_value เป็น null ให้คิดเป็น 0
                  0
                )
              : null;
            const subLatestActual = subData.length
              ? subData[subData.length - 1].actual_value
              : null;
            const subPreviousActual =
              subData.length > 1
                ? subData[subData.length - 2].actual_value
                : null;
            const subTrend =
              subLatestActual === null || subPreviousActual === null
                ? null
                : subLatestActual > subPreviousActual
                ? "up"
                : subLatestActual < subPreviousActual
                ? "down"
                : "same";

            return {
              id: sub.indicator_id,
              name: sub.name,
              target_value: sub.target_value,
              position: sub.position,
              actual_value: subTotalActual,
              trend: subTrend,
            };
          });

        return {
          id: main.indicator_id,
          name: main.name,
          unit: { unit_id: main.unit.unit_id, name: main.unit.name },
          target_value: main.target_value,
          main_indicator_id: main.main_indicator_id,
          responsible_jobtitles: main.responsible_jobtitle.map((r) => ({
            in_id: r.indicator_id,
            id: r.jobtitle.jobtitle_id,
            name: r.jobtitle.name,
          })),
          category_id: main.category_id,
          frequency: {
            frequency_id: main.frequency.frequency_id,
            name: main.frequency.name,
            periods_in_year: main.frequency.periods_in_year,
          },
          actual_value: TotalActual,
          trend,
          sub_indicators: subMapped,
        };
      });
      return mappedIndicators;
    } catch (error) {
      console.error("Error fetching indicators:", error);
      throw new Error("Failed to fetch indicators from database");
    }
  }

  static async getIndicatorsByResponsibleJobTitle(
    userId: string,
    catId: string
  ): Promise<MappedIndicator[]> {
    try {
      // The main query to fetch indicators directly
      const indicators = await prisma.indicator.findMany({
        where: {
          // Filter indicators where the user is directly responsible
          responsible_jobtitle: {
            some: {
              jobtitle: {
                user_jobtitle: {
                  some: {
                    user_id: userId,
                  },
                },
              },
            },
          },
        },
        include: {
          // Include all necessary related data
          category: {
            // <-- ADDED: To get category name
            select: { name: true },
          },
          unit: true,
          frequency: true,
          responsible_jobtitle: {
            include: {
              jobtitle: true,
            },
          },
          sub_indicators: {
            select: {
              indicator_id: true,
              name: true,
            },
          },
          indicator_data: {
            include: {
              period: true, // Include period details for each data point
            },
            orderBy: {
              period: {
                end_date: "desc", // Order data by most recent period
              },
            },
          },
        },
        orderBy: [
          {
            category: {
              name: "asc", // Optional: order by category name first
            },
          },
          {
            position: "asc", // Then order indicators by their position
          },
        ],
      });

      // Map the raw Prisma response to the desired clean structure
      return indicators.map((indicator) => ({
        id: indicator.indicator_id,
        name: indicator.name,
        target_value: indicator.target_value,
        date: indicator.date?.toISOString() || null,
        status: indicator.status,
        position: indicator.position,
        main_indicator_id: indicator.main_indicator_id,
        creator_user_id: indicator.user_id,
        category_id: indicator.category_id,
        category_name: indicator.category.name, // <-- ADDED
        unit: indicator.unit.name,
        frequency: indicator.frequency.name,
        responsible_jobtitles:
          indicator.responsible_jobtitle?.map((rjt) => rjt.jobtitle.name) || [],
        sub_indicators: indicator.sub_indicators.map((sub) => ({
          id: sub.indicator_id,
          name: sub.name,
        })),
        data:
          indicator.indicator_data?.map((data) => ({
            period_id: data.period_id,
            period_name: data.period.name,
            start_date: data.period.start_date.toISOString(),
            end_date: data.period.end_date.toISOString(),
            actual_value: data.actual_value,
          })) || [],
      }));
    } catch (error) {
      console.error(
        "Error fetching indicators by responsible job title from database:",
        error
      );
      throw new Error(
        "Failed to fetch indicators by responsible job title from database"
      );
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
      console.log("data=", data);
      if (!data.name?.trim() || !data.target_value?.toString().trim()) {
        throw new Error("Name and target are required");
      }
      // หาค่า position สูงสุดใน category ก่อน
      const maxPosition = await prisma.indicator.aggregate({
        where: { category_id: data.category_id, main_indicator_id: null },
        _max: { position: true },
      });

      const lastPosition = (maxPosition._max.position ?? 0) + 1;
      // create main indicator
      const newIndicator = await prisma.indicator.create({
        data: {
          name: data.name.trim(),
          target_value: parseFloat(data.target_value),
          unit_id: data.unit_id,
          frequency_id: data.frequency_id,
          category_id: data.category_id,
          user_id: userId.toString(),
          position: lastPosition,
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
        // สร้าง sub-indicator
        const createdSubs = await prisma.$transaction(
          data.sub_indicators.map((sub, idx) =>
            prisma.indicator.create({
              data: {
                name: sub.name.trim(),
                target_value: parseFloat(sub.target_value),
                unit_id: data.unit_id,
                frequency_id: data.frequency_id,
                category_id: data.category_id,
                user_id: userId.toString(),
                position: sub.position ?? idx + 1,
                main_indicator_id: newIndicator.indicator_id,
              },
            })
          )
        );

        // ใส่ jobtitle_ids (ใช้ชุดเดียวกับ main) ให้ทุก sub-indicator
        if (data.jobtitle_ids?.length) {
          for (const sub of createdSubs) {
            await prisma.responsibleJobTitle.createMany({
              data: data.jobtitle_ids.map((jobId) => ({
                indicator_id: sub.indicator_id,
                jobtitle_id: jobId,
              })),
            });
          }
        }
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
      console.error("Error updating indicator in database:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to updating indicator in database");
    }
  }

  static async updateIndicator(
    id: string,
    data: IndicatorPayload
  ): Promise<Indicator> {
    return await prisma.$transaction(async (tx) => {
      // 1️⃣ ดึง main indicator เดิมพร้อม sub indicators + responsible jobtitles
      const existingIndicator = await tx.indicator.findUnique({
        where: { indicator_id: id },
        include: { sub_indicators: true, responsible_jobtitle: true },
      });
      if (!existingIndicator) throw new Error("Indicator not found");

      // 2️⃣ อัปเดต main indicator
      await tx.indicator.update({
        where: { indicator_id: id },
        data: {
          name: data.name.trim(),
          target_value: parseFloat(data.target_value),
          unit_id: data.unit_id,
          frequency_id: data.frequency_id,
          category_id: data.category_id,
        },
      });

      // 3️⃣ อัปเดต responsible jobtitles
      await tx.responsibleJobTitle.deleteMany({ where: { indicator_id: id } });
      if (data.jobtitle_ids?.length) {
        await tx.responsibleJobTitle.createMany({
          data: data.jobtitle_ids.map((jobId) => ({
            indicator_id: id,
            jobtitle_id: jobId,
          })),
        });
      }

      // 3.1️⃣ อัปเดต responsible jobtitles ของ sub indicators ที่มีอยู่แล้ว
      for (const sub of existingIndicator.sub_indicators) {
        await tx.responsibleJobTitle.deleteMany({
          where: { indicator_id: sub.indicator_id },
        });

        if (data.jobtitle_ids?.length) {
          await tx.responsibleJobTitle.createMany({
            data: data.jobtitle_ids.map((jobId) => ({
              indicator_id: sub.indicator_id,
              jobtitle_id: jobId,
            })),
          });
        }
      }

      // 4️⃣ จัดการ sub indicators
      const incomingSubs = data.sub_indicators || [];

      // เตรียม map ของ sub id ที่มีอยู่จริง
      const existingSubIds = new Set(
        existingIndicator.sub_indicators.map((s) => s.indicator_id)
      );

      // สร้าง / อัปเดต sub indicators พร้อม position ชั่วคราว
      const allSubs: { id: string; position: number }[] = [];

      for (const [idx, sub] of incomingSubs.entries()) {
        const tempPosition = -1000 - idx;

        let result;
        if (sub.id && existingSubIds.has(sub.id)) {
          // มีอยู่จริง → update
          result = await tx.indicator.update({
            where: { indicator_id: sub.id },
            data: {
              name: sub.name.trim(),
              target_value: parseFloat(sub.target_value),
              position: tempPosition,
            },
          });
        } else {
          // ใหม่ → create
          result = await tx.indicator.create({
            data: {
              name: sub.name.trim(),
              target_value: parseFloat(sub.target_value),
              unit_id: data.unit_id,
              frequency_id: data.frequency_id,
              category_id: data.category_id,
              user_id: existingIndicator.user_id,
              main_indicator_id: id,
              position: tempPosition,
            },
          });

          // ใส่ responsible jobtitles ให้ sub ใหม่
          if (data.jobtitle_ids?.length) {
            await tx.responsibleJobTitle.createMany({
              data: data.jobtitle_ids.map((jobId) => ({
                indicator_id: result.indicator_id,
                jobtitle_id: jobId,
              })),
            });
          }
        }

        allSubs.push({
          id: result.indicator_id,
          position: sub.position ?? idx + 1,
        });
      }

      // 5️⃣ ลบ sub indicators ที่ถูกเอาออก
      const incomingIds = new Set(
        incomingSubs.filter((s) => s.id).map((s) => s.id!)
      );
      const toDelete = existingIndicator.sub_indicators.filter(
        (sub) => !incomingIds.has(sub.indicator_id)
      );
      if (toDelete.length > 0) {
        await tx.indicator.deleteMany({
          where: { indicator_id: { in: toDelete.map((s) => s.indicator_id) } },
        });
      }

      // 6️⃣ อัปเดต position จริง
      await Promise.all(
        allSubs.map((sub) =>
          tx.indicator.update({
            where: { indicator_id: sub.id },
            data: { position: sub.position },
          })
        )
      );

      // 7️⃣ ดึง indicator ใหม่ครบ
      const indicator = await tx.indicator.findUnique({
        where: { indicator_id: id },
        include: {
          unit: true,
          frequency: true,
          responsible_jobtitle: { include: { jobtitle: true } },
          sub_indicators: true,
        },
      });
      if (!indicator) throw new Error("Indicator not found after update");

      return {
        id: indicator.indicator_id,
        name: indicator.name,
        target_value: indicator.target_value,
        unit: { unit_id: indicator.unit.unit_id, name: indicator.unit.name },
        frequency: {
          frequency_id: indicator.frequency.frequency_id,
          name: indicator.frequency.name,
          periods_in_year: indicator.frequency.periods_in_year,
        },
        main_indicator_id: indicator.main_indicator_id,
        category_id: indicator.category_id,
        responsible_jobtitles: indicator.responsible_jobtitle.map((r) => ({
          in_id: r.indicator_id,
          id: r.jobtitle.jobtitle_id,
          name: r.jobtitle.name,
        })),
        sub_indicators: indicator.sub_indicators.map((s) => ({
          id: s.indicator_id,
          name: s.name,
          target_value: s.target_value,
          position: s.position,
        })),
      };
    });
  }

  static async reorderIndicators(indicators: ReorderPayload[], catId: string) {
    if (!indicators || indicators.length === 0) return;

    try {
      const updates = indicators.map((item) =>
        prisma.indicator.update({
          where: { indicator_id: item.id },
          data: { position: item.position },
        })
      );

      await prisma.$transaction(updates);

      console.log(
        `Reordered ${indicators.length} indicators in category ${catId}`
      );
    } catch (error) {
      console.error("Error reordering indicators:", error);
      throw error;
    }
  }
}
