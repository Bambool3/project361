import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from 'react';

// ตัวอย่างข้อมูลกลุ่ม KPI/หมวดใหญ่
type Category = {
  id: string;
  name: string;
  description: string;
};

const mockCategories: Category[] = [
  { id: '1', name: 'KPI งานบริหาร', description: 'ตัวชี้วัดประสิทธิภาพ แผนกบริหาร' },
  { id: '2', name: 'KPI งานวิชาการ', description: 'ตัวชี้วัดประสิทธิภาพ แผนกวิชาการ' }
];

const KpiTopic = () => {
  const r = useRouter();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", description: "" });

  function handleAddCategory() {
    if (!newCat.name) return;
    setCategories([...categories, { id: Date.now().toString(), ...newCat }]);
    setNewCat({ name: "", description: "" });
    setIsModalOpen(false);
  }

  // สมมติว่ามีการไปหน้ารายการ KPI ย่อยของหมวดใหญ่
  function openCategory(id: string) {
    // เช่น ใช้ router.push(`/kpi/category/${id}`)
    r.push("/dashboard");
    alert("ไปหน้าคุมกลุ่มหัวข้อใหญ่ id = " + id);
  }

  return (
    <main className="flex-1 bg-gray-50 min-h-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">รายการหัวข้อใหญ่ (หมวด KPI)</h2>
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors shadow"
            onClick={()=>setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> สร้างหัวข้อใหญ่
          </button>
        </div>
        {/* ตารางแสดงหัวข้อใหญ่ */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">ชื่อหัวข้อใหญ่</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">รายละเอียด</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-400 text-lg">
                    ยังไม่มีหัวข้อใหญ่ในระบบ
                  </td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-purple-50 cursor-pointer transition"
                    onClick={() => openCategory(cat.id)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 text-gray-700">{cat.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-purple-600 hover:text-purple-900 underline">จัดการ</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal เพิ่มหัวข้อใหญ่ */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50" onClick={()=>setIsModalOpen(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2 p-8" onClick={e=>e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">สร้างหัวข้อใหญ่ใหม่</h3>
              <div className="mb-3">
                <label className="block font-medium text-sm mb-1">ชื่อหัวข้อใหญ่</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  value={newCat.name}
                  onChange={e=>setNewCat(v=>({...v, name: e.target.value}))}
                  placeholder="ชื่อหมวด/กลุ่ม KPI"
                />
              </div>
              <div className="mb-5">
                <label className="block font-medium text-sm mb-1">รายละเอียด (ถ้ามี)</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  rows={2}
                  value={newCat.description}
                  onChange={e=>setNewCat(v=>({...v, description: e.target.value}))}
                  placeholder="รายละเอียดหัวข้อใหญ่"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200"
                  onClick={()=>setIsModalOpen(false)}
                  type="button"
                >ยกเลิก</button>
                <button 
                  className="px-4 py-2 bg-purple-600 rounded text-white hover:bg-purple-700"
                  onClick={handleAddCategory}
                  type="button"
                >บันทึก</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default KpiTopic;