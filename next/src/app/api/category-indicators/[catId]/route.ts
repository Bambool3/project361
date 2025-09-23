// src/app/api/category-indicators/[catId]
import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

//แสดง indicator ใน catId
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ catId: string }> }
) {
  try {
    const { catId } = await context.params;
    let kpis;
    const { searchParams } = new URL(request.url);
    const filterBy = searchParams.get("filterBy");
    const userId = searchParams.get("userId");

    if (userId && filterBy === "jobtitle") {
      kpis = await IndicatorServerService.getIndicatorsByResponsibleJobTitle(
        userId,
        catId
      );
    } else {
      kpis = await IndicatorServerService.getIndicatorsByCategory(catId);
    }

    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching KPIs" }, { status: 500 });
  }
}
