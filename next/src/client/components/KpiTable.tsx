import { useState } from 'react';

const dates = [
  '25 Jul 2025',
  '26 Jul 2025',
  '27 Jul 2025',
  '28 Jul 2025',
  'Yesterday',
  'Today',
  '31 Jul 2025',
];

// สมมุติค่า Target เป็นอาร์เรย์ตัวเลข
const targetValues = [500, 500, 500, 500, 500, 500, 500];

type KpiItem = {
  id: number;
  name: string;
  subName?: string;
  icon: string;
  values: (string | number)[];
};

const initialKpis: KpiItem[] = [
  { id: 1, name: 'ตัวชี้วัดที่ 1', icon: '🎯', values: ['', '', '25', '', '616', '', ''] },
  { id: 3, name: 'ตัวชี้วัดย่อย', subName: 'fdb', icon: '🎯', values: ['', '', '25', '', '', '', ''] },
];

export default function KpiTable() {
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpis);

  const handleChange = (kpiIndex: number, dateIndex: number, value: string) => {
    const newKpis = [...kpis];
    newKpis[kpiIndex].values[dateIndex] = value;
    setKpis(newKpis);
  };

  const calculateTotal = (values: (string | number)[]) => {
    return values.reduce((sum, val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val;
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  return (
    <div className="p-4 bg-purple-50 min-h-screen text-black">
      <div className="mb-4">
        <select className="border border-purple-300 rounded px-4 py-2 bg-white text-black">
          <option>Show all KPIs</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_repeat(7,minmax(100px,1fr))_minmax(100px,1fr)] 
                        items-center text-sm font-medium border-b border-purple-200">
          <div className="p-2"></div>
          <div className="p-2"></div>
          {dates.map((d, i) => (
            <div
              key={i}
              className={`p-2 text-center ${
                d === 'Today'
                  ? 'bg-purple-800 font-bold text-white'
                  : 'bg-purple-500 text-white'
              }`}
            >
              {d}
            </div>
          ))}
          <div className="p-2 text-center bg-purple-400 text-white font-bold">Total</div>
        </div>
        
        {/* Target Row */}
        <div className="grid grid-cols-[60px_1fr_repeat(7,minmax(100px,1fr))_minmax(100px,1fr)] 
                        items-center border-b border-purple-200 bg-purple-100">
          <div className="text-center font-bold text-purple-600">T</div>
          <div className="p-2 font-bold text-purple-600">Target</div>
          {targetValues.map((val, j) => (
            <div key={j} className="p-2">
              <div className="w-full text-purple-700 font-semibold text-center">{val}</div>
            </div>
          ))}
          <div className="p-2 text-center font-bold text-purple-600">
            
          </div>
        </div>

        {/* KPI Rows */}
        {kpis.map((kpi, i) => (
          <div
            key={kpi.id}
            className="grid grid-cols-[60px_1fr_repeat(7,minmax(100px,1fr))_minmax(100px,1fr)] items-center border-b border-purple-100"
          >
            <div className="text-center text-gray-500">{kpi.id}</div>
            <div className="p-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-500 text-lg">{kpi.icon}</span>
                <div>
                  <div className="font-medium">{kpi.name}</div>
                  {kpi.subName && (
                    <div className="text-xs text-gray-500">{kpi.subName}</div>
                  )}
                </div>
              </div>
            </div>
            {kpi.values.map((val, j) => (
              <div key={j} className="p-2">
                <input
                  type="text"
                  className="w-full border border-purple-200 rounded-lg px-2 py-1 text-center text-black bg-purple-50"
                  value={val}
                  onChange={(e) => handleChange(i, j, e.target.value)}
                />
              </div>
            ))}
            <div className="p-2 text-center font-semibold text-purple-700">
              {calculateTotal(kpi.values)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-right">
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
          Save
        </button>
      </div>
    </div>
  );
}