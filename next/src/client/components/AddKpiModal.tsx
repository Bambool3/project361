import { Crosshair, HelpCircle, ChevronDown, ChevronUp, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
}
type SubKpi = {
  id: string;
  name: string;
  target: string;
};

const kpiFormats = ["1,234", "$1,234.56", "15%"];
const kpiYears = ["รายวัน", "รายสัปดาห์", "รายเดือน", "รายไตรมาส", "รายปีปฏิทิน"];
const departments = ["ฝ่ายที่ 1", "ฝ่ายที่ 2", "ฝ่ายที่ 3"];

const AddKpiModal = ({ isOpen, onClose }: AddKpiModalProps) => {
  const [subkpis, setSubKpis] = useState<SubKpi[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [mainKpi, setMainKpi] = useState({
    name: "",
    target: "",
    format: kpiFormats[0],
    year: kpiYears[0],
    department: departments[0],
  });

  function addSubKpi() {
    setSubKpis([...subkpis, { id: crypto.randomUUID(), name: "", target: "" }]);
    setExpandedIndex(subkpis.length);
  }
  function removeSubKpi(idx: number) {
    setSubKpis(subkpis.filter((_, i) => i !== idx));
    if (expandedIndex === idx) setExpandedIndex(null);
  }
  function updateSubKpi(idx: number, key: keyof SubKpi, value: string) {
    const newsub = [...subkpis];
    newsub[idx][key] = value;
    setSubKpis(newsub);
  }
  function handleMainKpiChange(key: keyof typeof mainKpi, value: string) {
    setMainKpi((prev) => ({ ...prev, [key]: value }));
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(JSON.stringify({ ...mainKpi, subkpis }, null, 2));
    setMainKpi({
      name: "",
      target: "",
      format: kpiFormats[0],
      year: kpiYears[0],
      department: departments[0],
    });
    setSubKpis([]);
    setExpandedIndex(null);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl m-4 transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 sm:p-8">

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">เพิ่มตัวชี้วัด (KPI)</h2>
              <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                ศึกษาวิธีใช้งาน
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Main KPI (HORIZONTAL WRAP, NO SCROLL) */}
            <div className="flex flex-row flex-wrap gap-4 mb-8">
              <div className="flex flex-col flex-1 min-w-[180px] max-w-[240px]">
                <label htmlFor="kpi-name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อตัวชี้วัด</label>
                <div className="relative">
                  <input
                    type="text"
                    id="kpi-name"
                    placeholder="กรอกชื่อตัวชี้วัด"
                    className="pl-4 pr-12 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                    value={mainKpi.name}
                    onChange={(e) => handleMainKpiChange("name", e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                    <Crosshair className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                <label htmlFor="kpi-target" className="block text-sm font-medium text-gray-700 mb-1">เป้าหมาย</label>
                <input
                  type="text"
                  id="kpi-target"
                  placeholder="ระบุเป้าหมาย"
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                  value={mainKpi.target}
                  onChange={(e) => handleMainKpiChange("target", e.target.value)}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                <label htmlFor="kpi-format" className="block text-sm font-medium text-gray-700 mb-1">รูปแบบข้อมูล</label>
                <select
                  id="kpi-format"
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                  value={mainKpi.format}
                  onChange={(e) => handleMainKpiChange("format", e.target.value)}
                >
                  {kpiFormats.map(fmt => <option key={fmt}>{fmt}</option>)}
                </select>
              </div>
              <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                <label htmlFor="kpi-year" className="block text-sm font-medium text-gray-700 mb-1">รอบการรายงาน</label>
                <select
                  id="kpi-year"
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                  value={mainKpi.year}
                  onChange={(e) => handleMainKpiChange("year", e.target.value)}
                >
                  {kpiYears.map(year => <option key={year}>{year}</option>)}
                </select>
              </div>
              <div className="flex flex-col flex-1 min-w-[140px] max-w-[200px]">
                <label htmlFor="kpi-department" className="block text-sm font-medium text-gray-700 mb-1">ฝ่ายที่รับผิดชอบ</label>
                <select
                  id="kpi-department"
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                  value={mainKpi.department}
                  onChange={(e) => handleMainKpiChange("department", e.target.value)}
                >
                  {departments.map(dep => <option key={dep}>{dep}</option>)}
                </select>
              </div>
            </div>

            {/* Sub-KPI Section */}
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-purple-700 font-bold mb-2"
                onClick={addSubKpi}
              >
                <Plus className="w-4 h-4" /> เพิ่ม Sub-KPI
              </button>
              {subkpis.length === 0 ? (
                <div className="text-gray-500 text-sm mb-2">ยังไม่มี Sub-KPI</div>
              ) : (
                <div className="space-y-1">
                  {subkpis.map((sub, idx) => (
                    <div key={sub.id} className="mb-2">
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="mr-2"
                          aria-label="expand"
                          onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        >
                          {expandedIndex === idx
                            ? <ChevronUp className="w-5 h-5" />
                            : <ChevronDown className="w-5 h-5" />}
                        </button>
                        <span className="font-semibold text-gray-900">
                          {sub.name ? sub.name : "ชื่อ Sub-KPI"}
                        </span>
                        <button
                          type="button"
                          className="ml-auto text-red-500"
                          onClick={() => removeSubKpi(idx)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      {/* Expanded: inputs inline and wrap */}
                      {expandedIndex === idx && (
                        <div className="flex flex-row flex-wrap items-end bg-gray-100 border-l-4 border-purple-400 p-4 mt-2 rounded-lg gap-4">
                          <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                            <label className="text-xs font-medium text-gray-700 mb-1">ชื่อ Sub-KPI</label>
                            <input
                              type="text"
                              placeholder="ชื่อ Sub-KPI"
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                              value={sub.name}
                              onChange={(e) => updateSubKpi(idx, "name", e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                            <label className="text-xs font-medium text-gray-700 mb-1">เป้าหมาย Sub-KPI</label>
                            <input
                              type="text"
                              placeholder="เป้าหมาย Sub-KPI"
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                              value={sub.target}
                              onChange={(e) => updateSubKpi(idx, "target", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit/Cancel */}
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold"
              >
                บันทึกตัวชี้วัด
              </button>
              <button
                type="button"
                className="border border-gray-400 px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setMainKpi({
                    name: "",
                    target: "",
                    format: kpiFormats[0],
                    year: kpiYears[0],
                    department: departments[0],
                  });
                  setSubKpis([]);
                  setExpandedIndex(null);
                  onClose();
                }}
              >
                ยกเลิก
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKpiModal;