import { Indicator } from "@/types/management";

export class IndicatorService {
  private static baseUrl = "/api/management";
  static async getIndicator() {
    const res = await fetch(this.baseUrl);
  }
}
