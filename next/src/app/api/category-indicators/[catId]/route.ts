// src/app/api/category-indicators/[catId]

import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

export async function GET(
  request: NextRequest,
  context: { params: { catId: string } }
) {
  try {
    const catId = (await (await context).params).catId;
    const kpis = await IndicatorServerService.getIndicatorsByCategory(catId);
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching KPIs" }, { status: 500 });
  }
}
