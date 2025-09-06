// src/app/api/category/[catId]/kpi/route.ts

import { NextRequest, NextResponse } from "next/server";
import { IndicatorServerService } from "@/server/services/indicator/indicator-server-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { catId: string } }
) {
  try {
    const catId = params.catId;
    const kpis = await IndicatorServerService.getIndicatorsByCategory(catId);
    return NextResponse.json(kpis);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching KPIs" }, { status: 500 });
  }
}
