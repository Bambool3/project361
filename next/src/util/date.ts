export const formatDateRange = (periods: any[]) => {
  if (!periods || periods.length === 0) return "ไม่มีข้อมูล";
  if (periods.length === 1) {
    const period = periods[0];
    return `${new Date(period.start_date).toLocaleDateString(
      "th-TH"
    )} - ${new Date(period.end_date).toLocaleDateString("th-TH")}`;
  }
  return `${periods.length} ช่วงเวลา`;
};
