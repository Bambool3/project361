"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Plus, Trash2, ChevronDown, ChevronUp, Crosshair } from "lucide-react";

// Zod Schema
const subKpiSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "กรุณากรอกชื่อตัวชี้วัดย่อย"),
  target: z.string().min(1, "กรุณากรอกเป้าหมายตัวชี้วัดย่อย"),
});

const mainKpiSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อตัวชี้วัด").max(50),
  target: z.string().min(1, "กรุณากรอกเป้าหมาย"),
  format: z.string(),
  year: z.string(),
  department: z.string(),
  subKpis: z.array(subKpiSchema),
});

type FormData = z.infer<typeof mainKpiSchema>;

interface AddKpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}

const kpiFormats = ["1,234", "$1,234.56", "15%"];
const kpiYears = ["รายวัน", "รายสัปดาห์", "รายเดือน", "รายไตรมาส", "รายปี"];
const departments = ["ฝ่ายที่ 1", "ฝ่ายที่ 2", "ฝ่ายที่ 3"];

export default function AddKpiModal({
  isOpen,
  onClose,
  onSubmit,
}: AddKpiModalProps) {
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(mainKpiSchema),
    defaultValues: {
      name: "",
      target: "",
      format: kpiFormats[0],
      year: kpiYears[0],
      department: departments[0],
      subKpis: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "subKpis",
  });

  if (!isOpen) return null;

  const submitForm = async (data: FormData) => {
    // แสดงข้อมูลใน alert
    alert(JSON.stringify(data, null, 2));

    // เรียก onSubmit ตามปกติ
    await onSubmit(data);

    // รีเซ็ต form
    reset();
    setExpandedIndexes([]);
    onClose();
  };

  const toggleExpand = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl m-4 z-50 overflow-auto max-h-[90vh] transition-all duration-300">
        <form onSubmit={handleSubmit(submitForm)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              เพิ่มตัวชี้วัด
            </h2>

            {/* Main KPI */}
            <div className="flex flex-row flex-wrap gap-4 mb-8">
              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[180px] max-w-[240px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อตัวชี้วัด
                    </label>
                    <div className="relative">
                      <input
                        {...field}
                        placeholder="กรอกชื่อตัวชี้วัด"
                        className="pl-4 pr-12 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition w-full"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-red-500">
                        <Crosshair className="w-5 h-5" />
                      </div>
                    </div>
                    {errors.name && (
                      <span className="text-red-500 text-xs">
                        {errors.name.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Target */}
              <Controller
                name="target"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เป้าหมาย
                    </label>
                    <input
                      {...field}
                      placeholder="ระบุเป้าหมาย"
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    />
                    {errors.target && (
                      <span className="text-red-500 text-xs">
                        {errors.target.message}
                      </span>
                    )}
                  </div>
                )}
              />

              {/* Format */}
              <Controller
                name="format"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รูปแบบข้อมูล
                    </label>
                    <select
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    >
                      {kpiFormats.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}
              />

              {/* Year */}
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[120px] max-w-[170px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      รอบการรายงาน
                    </label>
                    <select
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    >
                      {kpiYears.map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                )}
              />

              {/* Department */}
              <Controller
                name="department"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col flex-1 min-w-[140px] max-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ฝ่ายที่รับผิดชอบ
                    </label>
                    <select
                      {...field}
                      className="px-4 py-2 border border-gray-300 rounded-lg w-full"
                    >
                      {departments.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                )}
              />
            </div>

            {/* Sub-KPI */}
            <div className="mt-4">
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-purple-700 font-bold mb-2"
                onClick={() =>
                  append({ id: crypto.randomUUID(), name: "", target: "" })
                }
              >
                <Plus className="w-4 h-4" /> เพิ่มตัวชี้วัดย่อย
              </button>

              {fields.length === 0 ? (
                <div className="text-gray-500 text-sm mb-2">
                  ยังไม่มีตัวชี้วัดย่อย
                </div>
              ) : (
                <div className="space-y-1">
                  {fields.map((sub, idx) => (
                    <div key={sub.id}>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="mr-2"
                          onClick={() => toggleExpand(idx)}
                        >
                          {expandedIndexes.includes(idx) ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                        <span className="font-semibold text-gray-900">
                          {sub.name || "ชื่อ Sub-KPI"}
                        </span>
                        <button
                          type="button"
                          className="ml-auto text-red-500"
                          onClick={() => remove(idx)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {expandedIndexes.includes(idx) && (
                        <div className="flex flex-row flex-wrap items-end bg-gray-100 border-l-4 border-purple-400 p-4 mt-2 rounded-lg gap-4">
                          {/* ชื่อ Sub-KPI */}
                          <Controller
                            name={`subKpis.${idx}.name`}
                            control={control}
                            render={({ field }) => (
                              <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                                <label className="text-xs font-medium text-gray-700 mb-1">
                                  ชื่อตัวชี้วัด
                                </label>
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="ชื่อตัวชี้วัด"
                                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                                  required
                                />
                                {errors.subKpis?.[idx]?.name && (
                                  <span className="text-red-500 text-xs">
                                    {errors.subKpis[idx]?.name?.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />

                          {/* เป้าหมาย Sub-KPI */}
                          <Controller
                            name={`subKpis.${idx}.target`}
                            control={control}
                            render={({ field }) => (
                              <div className="flex flex-col flex-1 min-w-[200px] max-w-[280px]">
                                <label className="text-xs font-medium text-gray-700 mb-1">
                                  เป้าหมาย
                                </label>
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="เป้าหมาย"
                                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
                                  required
                                />
                                {errors.subKpis?.[idx]?.target && (
                                  <span className="text-red-500 text-xs">
                                    {errors.subKpis[idx]?.target?.message}
                                  </span>
                                )}
                              </div>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold"
              >
                บันทึกตัวชี้วัด
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setExpandedIndexes([]);
                  onClose();
                }}
                className="border border-gray-400 px-6 py-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
