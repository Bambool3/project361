import { ChevronDown, MoreHorizontal, Search, LayoutGrid, Plus, ArrowUpDown } from "lucide-react";
import { useState } from 'react';
import AddKpiModal from "@/client/components/AddKpiModal";

// 1. กำหนด Type (TypeScript)
type KpiKey = "id" | "name" | "type" | "assign" | "frequency" | "format" | "direction" | "target";
type Kpi = Record<KpiKey, string | number>;

// 2. Header ของ Table
const tableHeaders: { key: KpiKey, label: string }[] = [
    { key: 'id', label: 'ID'},
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'assign', label: 'Assign' },
    { key: 'frequency', label: 'Frequency'},
    { key: 'format', label: 'Format' },
    { key: 'direction', label: 'Direction'},
    { key: 'target', label: 'Target' }
];

// 3. ข้อมูลตัวอย่าง (Sample Data)
const sampleData: Kpi[] = [
    {
        id: 1,
        name: "ยอดขายประจำเดือน",
        type: "การเงิน",
        assign: "ฝ่ายขาย",
        frequency: "รายเดือน",
        format: "บาท",
        direction: "Up",
        target: "1,000,000"
    },
    {
        id: 2,
        name: "จำนวนข้อร้องเรียน",
        type: "ลูกค้า",
        assign: "ลูกค้าสัมพันธ์",
        frequency: "รายเดือน",
        format: "รายการ",
        direction: "Down",
        target: "ไม่เกิน 20"
    },
    {
        id: 3,
        name: "คะแนนความพึงพอใจ",
        type: "บริการ",
        assign: "ฝ่ายบริการ",
        frequency: "รายไตรมาส",
        format: "คะแนน (เต็ม 5)",
        direction: "Up",
        target: "มากกว่า 4.5"
    }
];

const MainContent = () => {
    const [isModalOpen, setModalOpen] = useState(false);

    return (
        <>
            <main className="flex-1 bg-gray-50 min-h-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Responsive Toolbar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="category" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Category:
                                </label>
                                <div className="relative">
                                    <select 
                                        id="category" 
                                        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-w-32"
                                        >
                                        <option>Default</option>
                                        <option>Sales</option>
                                        <option>Marketing</option>
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                <MoreHorizontal />
                            </button>
                        </div>
                        
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                placeholder="Search KPIs..."
                            />
                        </div>
                    </div>

                    {/* Responsive Table Container */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                        {/* Mobile Cards View */}
                        <div className="block sm:hidden">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <LayoutGrid className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs in this category</h3>
                                <p className="text-gray-500 mb-6">Start tracking your performance by adding a KPI.</p>
                                <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Add a KPI to this category
                                </button>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {tableHeaders.map(header => (
                                            <th 
                                                key={header.key} 
                                                scope="col" 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700 transition-colors">
                                                    {header.label}
                                                    <ArrowUpDown className="w-3 h-3" />
                                                </div>
                                            </th>
                                        ))}
                                        <th scope="col" className="relative px-6 py-3 w-12">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sampleData.length === 0 ? (
                                        <tr>
                                            <td colSpan={tableHeaders.length + 1}>
                                                <div className="text-center py-16 px-6">
                                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <LayoutGrid className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No KPIs in this category</h3>
                                                    <p className="text-gray-500 mb-6">Start tracking your performance by adding a KPI.</p>
                                                    <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white shadow-sm text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
                                                        <Plus className="w-4 h-4" />
                                                        Add a KPI to this category
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sampleData.map((row) => (
                                            <tr key={row.id}>
                                                {tableHeaders.map(header => (
                                                    <td key={header.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {row[header.key]}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <MoreHorizontal />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
            <AddKpiModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        </>
    );
};

export default MainContent;