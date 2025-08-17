import { useState } from "react";

const dates = [
  "ไตรมาสที่ 1 ปี 2567",
  "ไตรมาสที่ 2 ปี 2567",
  "ไตรมาสที่ 3 ปี 2567",
  "ไตรมาสที่ 4 ปี 2567",
  "ไตรมาสที่ 1 ปี 2568",
  "ไตรมาสที่ 2 ปี 2568",
  "ไตรมาสที่ 3 ปี 2568",
];

type KpiItem = {
  id: number;
  name: string;
  subName?: string;
  icon: string;
  values: string[];
  targets: number[];
};

const initialKpis: KpiItem[] = [
  {
    id: 1,
    name: "ตัวชี้วัดที่ 1",
    icon: "🎯",
    values: Array(7).fill(""),
    targets: Array(7).fill(200),
  },
  {
    id: 2,
    name: "ตัวชี้วัดย่อย",
    subName: "fdb",
    icon: "🎯",
    values: Array(7).fill(""),
    targets: Array(7).fill(100),
  },
];

export default function KpiTable() {
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpis);
  const [startDateIndex, setStartDateIndex] = useState(0);
  const visibleDays = 3;
  const visibleDates = dates.slice(startDateIndex, startDateIndex + visibleDays);

  // ยังเน้นตารางให้กว้าง
  const gridTemplateCols = `
    60px 
    2fr 
    ${visibleDays > 0 ? `repeat(${visibleDays}, minmax(210px,1fr))` : ""}
    minmax(150px,1fr)
  `;

  const handleChange = (kpiIndex: number, dateIndex: number, value: string) => {
    const newKpis = [...kpis];
    newKpis[kpiIndex].values[dateIndex] = value;
    setKpis(newKpis);
  };

  const calculateTotal = (values: string[]): number =>
    values.reduce((sum, val) => {
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  return (
    <div className="p-4 bg-white min-h-screen text-black flex flex-col items-center">

      {/* เลือกช่วงเริ่มต้น */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl shadow p-3 mb-6 w-full max-w-7xl gap-6">
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-black text-base focus:ring-2 focus:ring-[var(--color-purple)] shadow-sm"
          value={dates[startDateIndex]}
          onChange={e => {
            const selectedIndex = dates.findIndex((d) => d === e.target.value);
            if (selectedIndex >= 0) {
              const newStart = Math.min(
                Math.max(0, selectedIndex),
                dates.length - visibleDays
              );
              setStartDateIndex(newStart);
            }
          }}
        >
          {dates.slice(0, dates.length - visibleDays + 1).map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => setStartDateIndex((prev) => Math.max(0, prev - 1))}
            disabled={startDateIndex === 0}
            className="
              px-4 py-2 rounded-lg text-base text-[var(--color-purple)] bg-white
              border border-[var(--color-purple)] transition disabled:bg-gray-100 disabled:text-gray-300
              hover:bg-[var(--color-purple)] hover:text-white shadow-sm font-semibold
              "
          >
            ◀
          </button>
          <button
            onClick={() =>
              setStartDateIndex((prev) =>
                Math.min(dates.length - visibleDays, prev + 1)
              )
            }
            disabled={startDateIndex + visibleDays >= dates.length}
            className="
              px-4 py-2 rounded-lg text-base text-[var(--color-purple)] bg-white
              border border-[var(--color-purple)] transition disabled:bg-gray-100 disabled:text-gray-300
              hover:bg-[var(--color-purple)] hover:text-white shadow-sm font-semibold
              "
          >
            ▶
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div
        className="
          grid items-center text-base font-semibold
          border-b border-gray-200
          bg-[var(--color-purple)] text-white
          rounded-t-lg shadow w-full max-w-7xl
        "
        style={{ gridTemplateColumns: gridTemplateCols }}
      >
        <div className="py-3 text-center"></div>
        <div className="py-3 text-center"></div>
        {visibleDates.map((d, i) => (
          <div key={i} className="py-3 text-center transition-all text-base rounded">
            {d}
          </div>
        ))}
        <div className="py-3 text-center bg-purple-900 text-white font-bold rounded-tr-lg text-base">
          รวม
        </div>
      </div>

      {/* KPI Rows */}
      {kpis.map((kpi, i) => (
        <div
          key={kpi.id}
          className="w-full max-w-7xl mb-4 shadow-lg rounded-xl bg-white border border-gray-100 transition hover:shadow-xl"
        >
          <div
            className="grid items-center"
            style={{ gridTemplateColumns: gridTemplateCols }}
          >
            <div className="text-center text-base text-gray-400 py-3">{kpi.id}</div>
            <div className="py-3 px-3">
              <div className="flex items-center gap-4">
                <span className="text-lg">{kpi.icon}</span>
                <div>
                  <div className="font-bold text-base text-gray-800">{kpi.name}</div>
                  {kpi.subName && (
                    <div className="text-sm text-gray-400">{kpi.subName}</div>
                  )}
                </div>
              </div>
            </div>
            {visibleDates.map((_, j) => {
              const index = startDateIndex + j;
              const value = kpi.values[index] || "";
              const target = kpi.targets[index];
              return (
                <div key={j} className="py-2 px-2">
                  <input
                    type="text"
                    className="
                      w-full border border-gray-300
                      rounded-lg px-3 py-2 text-center
                      text-black bg-white text-base transition
                      ring-0 focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)]
                      shadow-inner"
                    value={`${value}/${target}`}
                    onChange={(e) => {
                      const inputValue = e.target.value.split("/")[0];
                      handleChange(i, index, inputValue);
                    }}
                  />
                </div>
              );
            })}
            <div className="py-2 px-2 text-center font-bold text-[var(--color-purple)] text-lg bg-gray-50 rounded-r-lg">
              {calculateTotal(kpi.values)}
            </div>
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="mt-8 w-full max-w-7xl text-right">
        <button className="
            bg-[var(--color-purple)] hover:bg-purple-900
            text-white px-8 py-2 text-base font-bold shadow-md
            rounded-full transition">
          บันทึก
        </button>
      </div>
    </div>
  );
}