import { Crosshair, HelpCircle, ChevronDown, ExternalLink, Plus, Trash2} from 'lucide-react';
import { useState } from 'react';

interface AddKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type SubKpi = {
  name:string;
}
  
const AddKpiModal = ({ isOpen, onClose }: AddKpiModalProps) => {
  const [subkpis, setSubKpis] = useState<SubKpi[]>([])

  const [mainKpi, setMainKpi] = useState({
    name: "",
    target: "",
    format: "1,234",
    year: "",
    department: "",
  })
  // เพิ่มข้อมูล subkpis
  function addSubKpi() {
    setSubKpis([...subkpis, {name:""}])

    console.log("เพิ่ม sub kpi ปล่าวแล้ว")
  }
  // ลบข้อมูล subkpis
  function removeSubKpi(idx: number) {
    setSubKpis(subkpis.filter((x,i) => i != idx))

    console.log("ลบ sub kpi แล้ว")
  }
  // เปลียนค่า subKpis
  function updateSubKpi(idx:number, key: keyof SubKpi, value: string) {
    const newsub = [...subkpis]
    newsub[idx][key] = value
    setSubKpis(newsub)

    console.log("รายการ sub kpi ใหม่ =",newsub)
  }
  // ฟังก์ชันปรับค่าฟิลด์ใน main KPI
  function handleMainKpiChange(key: string, value: string) {
    setMainKpi((prev) => ({ ...prev, [key]: value }));
    
    console.log("ค่าใน main เปลี่ยนเป็น",mainKpi)
  }


    // ฟังก์ชันเมื่อ submit ฟอร์ม (ส่งข้อมูล)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // แสดงตัวอย่างข้อมูลที่จะส่ง API (สามารถเปลี่ยนเป็น fetch/axios ได้)
    alert(JSON.stringify({ ...mainKpi, subkpis }, null, 2));
    // Reset state และปิด modal
    setMainKpi({
      name: "",
      target: "",
      format: "",
      year: "",
      department: "department 1",
    });
    setSubKpis([]);
    onClose();
  }


    if (!isOpen) return null;
  
    return (
      // Backdrop
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        {/* Modal Panel */}
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-all duration-300 ease-out"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 sm:p-8">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add a KPI</h2>
                <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1">
                  Learn more
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
    
              {/* Form */}
              <div className="space-y-5">
                {/* KPI Name Input */}
                <div>
                  <label htmlFor="kpi-name" className="sr-only">Give your KPI a name</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="kpi-name"
                      placeholder="Give your KPI a name"
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      value={mainKpi.name}
                      onChange={(e) => handleMainKpiChange("name", e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                      <Crosshair className="w-6 h-6" />
                    </div>
                  </div>
                </div>
    
                {/* Selects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Target KPI Input */}
                  <div>
                    <label htmlFor="kpi-target" className="block text-sm font-medium text-gray-700 mb-1">Does the KPI have a target?</label>
                    <input
                      type="text"
                      id="kpi-target"
                      placeholder="Target KPI"
                      className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      value={mainKpi.target}
                      onChange={(e) => handleMainKpiChange("target", e.target.value)}
                    />
                  </div>

                  {/* format KPI input */}
                  <div>
                    <label htmlFor="kpi-format" className="block text-sm font-medium text-gray-700 mb-1">What is the Format?</label>
                    <div className="flex items-center gap-2">
                      <select 
                        id="kpi-format" 
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white"
                        value={mainKpi.format}
                        onChange={(e) => handleMainKpiChange("format",e.target.value)}
                      >
                        <option>1,234</option>
                        <option>$1,234.56</option>
                        <option>15%</option>
                      </select>
                      <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"/>
                    </div>
                  </div>
                  
                  {/* KPI year input */}
                  <div>
                    <label htmlFor="kpi-year" className="block text-sm font-medium text-gray-700 mb-1">When will this KPI be entered?</label>
                    <div className="flex items-center gap-2">
                      <select 
                        id="kpi-year" 
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white"
                        value={mainKpi.year}
                        onChange={(e) => handleMainKpiChange("year",e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Calendar year</option>
                      </select>
                      <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"/>
                    </div>
                  </div>

                  {/* department KPI input */}
                  <div>
                    <label htmlFor="kpi-department" className="block text-sm font-medium text-gray-700 mb-1">Which department will enter this KPI?</label>
                    <div className="flex items-center gap-2">
                      <select 
                        id="kpi-department" 
                        className="w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition appearance-none bg-white"
                        value={mainKpi.department}
                        onChange={(e) => handleMainKpiChange("department",e.target.value)}
                      >
                        <option>department 1</option>
                        <option>department 2</option>
                        <option>department 3</option>
                      </select>
                      <HelpCircle className="text-gray-400 hover:text-gray-600 cursor-pointer w-5 h-5"/>
                    </div>
                  </div>                
                </div>

                {/* subkpi */}
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <label className='font-medium text-gray-800'>Sub-KPIs</label>
                    <button 
                      type="button"
                      className='flex items-center gap-1 text-sm text-purple-700 font-medium hover:underline'
                      onClick={addSubKpi}
                    >
                      <Plus className="w-4 h-4" /> Add Sub-KPI
                    </button>
                  </div>
                </div>

                {/* กรณีไม่มี sub-KPI ให้แสดงข้อความ */}
                {subkpis.length === 0 && (
                  <div className="text-gray-500 text-sm mb-2">
                    ยังไม่ได้เลือก sub kpi
                  </div>
                )}

                {/* ตรงกลางของ sub KPI */}
                <div className='space-y-2'>
                  {subkpis.map((sub, idx) => (
                    <div key={idx} className='flex gap-2 items-center'>
                      <input
                        type='text'
                        placeholder='Sub-KPI Name'
                        className='w-full px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition'
                        value={sub.name}
                        onChange={(e) => updateSubKpi(idx, "name", e.target.value)}
                        required
                      >
                      </input>
                      <button
                        type='button'
                        aria-label='Remove sub-KPI'
                        onClick={() => removeSubKpi(idx)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                  ))}


                </div>
                
                {/* Accordions */}
                <div className="space-y-3">
                    <details className="bg-gray-50 p-4 rounded-lg cursor-pointer group">
                        <summary className="flex justify-between items-center font-medium text-gray-700 list-none">
                            More Options
                            <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform"/>
                        </summary>
                        <p className="text-gray-600 mt-3">More configuration options can be placed here, like setting deadlines or assigning owners.</p>
                    </details>
                    <details className="bg-gray-50 p-4 rounded-lg cursor-pointer group">
                        <summary className="flex justify-between items-center font-medium text-gray-700 list-none">
                            Create a formula
                            <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform"/>
                        </summary>
                        <p className="text-gray-600 mt-3">A formula builder or advanced calculation settings could be included in this section.</p>
                    </details>
                </div>
              </div>
            </div>
    
            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex flex-col sm:flex-row-reverse sm:items-center gap-3">
              <button className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                Save
              </button>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
            </div>
            
          </form>
        </div>
      </div>
    );
  };

  export default AddKpiModal;




